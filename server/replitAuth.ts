import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import memorystore from "memorystore";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store instead of PostgreSQL to avoid rate limit issues
  const MemoryStore = memorystore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'replit-session-secret',
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // Desativamos secure para desenvolvimento
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const domain = req.hostname;
    console.log("Autenticando com domínio:", domain);
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const domain = req.hostname;
    console.log("Callback com domínio:", domain);
    
    // Adicionar mais logs para debug
    console.log("Parâmetros de callback:", req.query);
    
    passport.authenticate(`replitauth:${domain}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
      failureMessage: true
    })(req, res, next);
  });
  
  // Rota de debug para verificar estado da sessão
  app.get("/api/auth/debug", (req, res) => {
    console.log("Debug de autenticação:");
    console.log("- isAuthenticated:", req.isAuthenticated());
    console.log("- session:", req.session);
    console.log("- user:", req.user);
    
    res.json({
      authenticated: req.isAuthenticated(),
      sessionId: req.sessionID,
      hasUser: !!req.user
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log("Verificando autenticação:");
  console.log("- isAuthenticated:", req.isAuthenticated());
  console.log("- session ID:", req.sessionID);
  
  const user = req.user as any;
  console.log("- user object:", user ? "Presente" : "Ausente");

  if (!req.isAuthenticated() || !user) {
    console.log("Não autenticado ou usuário não encontrado");
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("- user claims:", user.claims ? "Presente" : "Ausente");
  
  if (!user.claims || !user.claims.sub) {
    console.log("Claims do usuário não encontradas");
    // Tente recuperar o usuário novamente em vez de retornar erro
    return res.redirect("/api/login");
  }

  // Armazenar informações importantes na sessão
  if (!req.session.userId && user.claims.sub) {
    req.session.userId = user.claims.sub;
    req.session.save();
  }
  
  // Se o token expirou, tente atualizar
  const now = Math.floor(Date.now() / 1000);
  if (user.expires_at && now > user.expires_at) {
    console.log("Token expirado, tentando atualizar");
    
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      console.log("Refresh token não encontrado");
      return res.redirect("/api/login");
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      console.log("Token atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar token:", error);
      return res.redirect("/api/login");
    }
  }
  
  console.log("Usuário autenticado com sucesso:", user.claims?.sub);
  return next();
};
