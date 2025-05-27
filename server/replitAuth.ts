import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import memorystore from "memorystore";
import "../shared/types";

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
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 dias
  
  // Usar PostgreSQL para armazenar sessões persistentes
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'replit-session-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
  const userData = {
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  };
  
  console.log("Registrando/atualizando usuário:", userData.id, userData.email);
  return await storage.upsertUser(userData);
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
    
    // Certifique-se de salvar o usuário no banco de dados
    const dbUser = await upsertUser(tokens.claims());
    
    // Adicione o ID do usuário do banco ao objeto de usuário da sessão para fácil referência
    (user as any).dbUserId = dbUser.id;
    
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

  // Serialização mais robusta para persistência de sessão
  passport.serializeUser((user: Express.User, cb) => {
    console.log("Serializando usuário:", (user as any).claims?.sub);
    cb(null, user);
  });
  
  passport.deserializeUser((user: Express.User, cb) => {
    console.log("Desserializando usuário:", (user as any).claims?.sub);
    cb(null, user);
  });

  // Rota principal de login (sem referência ao Replit)
  app.get("/api/login", (req, res, next) => {
    const domain = req.hostname;
    console.log("Autenticando com domínio:", domain);
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  // Rotas específicas para provedores de login
  app.get("/api/login/google", (req, res, next) => {
    // Esta rota usa a mesma autenticação, apenas é uma entrada dedicada para Google
    const domain = req.hostname;
    // Redirecionar para autenticação principal com um parâmetro especial
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
      login_hint: "google" // Isso não faz nada no Replit Auth, mas mantemos por consistência
    })(req, res, next);
  });

  app.get("/api/login/apple", (req, res, next) => {
    // Esta rota usa a mesma autenticação, apenas é uma entrada dedicada para Apple
    const domain = req.hostname;
    // Redirecionar para autenticação principal com um parâmetro especial
    passport.authenticate(`replitauth:${domain}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
      login_hint: "apple" // Isso não faz nada no Replit Auth, mas mantemos por consistência
    })(req, res, next);
  });
  
  app.get("/api/callback", (req, res, next) => {
    const domain = req.hostname;
    console.log("Callback com domínio:", domain);
    console.log("Parâmetros de callback:", req.query);
    
    passport.authenticate(`replitauth:${domain}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/login",
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
    // Limpar informações de sessão personalizadas
    req.session.devUserId = undefined;
    req.session.devIsAuthenticated = undefined;
    
    // Logout padrão
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}/login`,
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
    // Para requisições de API, retornar erro JSON ao invés de redirect
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ message: "Session expired, please refresh the page" });
    }
    return res.redirect("/api/login");
  }

  // Garantir que o ID do usuário seja salvo na sessão
  if (user.claims.sub) {
    // @ts-ignore - Ignorar o erro de tipos, pois já definimos o tipo em shared/types.ts
    req.session.userId = user.claims.sub;
    await new Promise<void>((resolve) => {
      req.session.save(() => resolve());
    });
    console.log("ID do usuário salvo na sessão:", user.claims.sub);
  }
  
  // Se o token expirou, tente atualizar
  const now = Math.floor(Date.now() / 1000);
  if (user.expires_at && now > user.expires_at) {
    console.log("Token expirado, tentando atualizar");
    
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      console.log("Refresh token não encontrado");
      // Para requisições de API, retornar erro JSON ao invés de redirect
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ message: "Session expired, please refresh the page" });
      }
      return res.redirect("/api/login");
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      console.log("Token atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar token:", error);
      // Para requisições de API, retornar erro JSON ao invés de redirect
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ message: "Session expired, please refresh the page" });
      }
      return res.redirect("/api/login");
    }
  }
  
  console.log("Usuário autenticado com sucesso:", user.claims?.sub);
  return next();
};
