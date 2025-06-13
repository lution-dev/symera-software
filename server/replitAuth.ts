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

// Support both development and production domains
const replitDomains = process.env.REPLIT_DOMAINS || '';
const customDomains = 'app.symera.com.br';
const allDomains = [replitDomains, customDomains].filter(Boolean).join(',');

if (!allDomains) {
  throw new Error("No domains configured for authentication");
}

const getOidcConfig = memoize(
  async () => {
    try {
      console.log("Configurando OpenID com REPL_ID:", process.env.REPL_ID);
      return await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!
      );
    } catch (error) {
      console.error("Erro ao configurar OpenID:", error);
      throw error;
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 dias
  
  // Usar MemoryStore temporariamente para garantir que a autenticação funcione
  const MemoryStore = memorystore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'replit-session-secret-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    cookie: {
      httpOnly: true,
      secure: false, // Permitir em desenvolvimento
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

  const domains = allDomains.split(",").map(d => d.trim()).filter(Boolean);
  console.log("Configurando estratégias de autenticação para domínios:", domains);
  
  for (const domain of domains) {
    const strategyName = `replitauth:${domain}`;
    console.log(`Registrando estratégia: ${strategyName}`);
    
    const strategy = new Strategy(
      {
        name: strategyName,
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

  // Rota principal de login
  app.get("/api/login", (req, res, next) => {
    const domain = req.hostname;
    const strategyName = `replitauth:${domain}`;
    passport.authenticate(strategyName)(req, res, next);
  });

  // Rotas específicas para provedores de login
  app.get("/api/login/google", (req, res, next) => {
    const domain = req.hostname;
    passport.authenticate(`replitauth:${domain}`)(req, res, next);
  });

  app.get("/api/login/apple", (req, res, next) => {
    const domain = req.hostname;
    passport.authenticate(`replitauth:${domain}`)(req, res, next);
  });
  
  app.get("/api/callback", (req, res, next) => {
    const domain = req.hostname;
    console.log("Callback com domínio:", domain);
    console.log("Parâmetros de callback:", req.query);
    
    passport.authenticate(`replitauth:${domain}`, {
      successRedirect: "/",
      failureRedirect: "/auth"
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
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}/auth`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log("Verificando autenticação do usuário:");
  console.log("- Session ID:", req.sessionID);
  console.log("- Is Authenticated:", req.isAuthenticated());
  
  const user = req.user as any;
  
  if (!req.isAuthenticated() || !user) {
    console.log("- Usuário não autenticado");
    return res.status(401).json({ message: "Unauthorized - Login Required" });
  }

  // Verificar se o usuário tem claims válidos
  if (!user.claims || !user.claims.sub) {
    console.log("- Claims do usuário inválidos ou ausentes");
    return res.status(401).json({ message: "Unauthorized - Invalid Session" });
  }

  console.log("- Usuário autenticado:", user.claims.sub);

  // Garantir que o ID do usuário seja salvo na sessão
  if (user.claims.sub) {
    // @ts-ignore - Ignorar o erro de tipos, pois já definimos o tipo em shared/types.ts
    req.session.userId = user.claims.sub;
    await new Promise<void>((resolve) => {
      req.session.save(() => resolve());
    });
    console.log("ID do usuário salvo na sessão:", user.claims.sub);
  }
  
  // Se o token expirou, tente atualizar - mas para uploads de arquivo, pule por enquanto
  const now = Math.floor(Date.now() / 1000);
  if (user.expires_at && now > user.expires_at) {
    console.log("Token expirado, tentando atualizar");
    
    // Para uploads de documentos, vamos temporariamente permitir o acesso mesmo com token expirado
    // se o usuário tem claims válidos (isso evita problemas com uploads longos)
    if (req.url.includes('/documents') && req.method === 'POST') {
      console.log("Upload de documento detectado - permitindo com token expirado mas claims válidos");
      return next();
    }
    
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
      
      // Limpar completamente o usuário e sessão
      req.logout((logoutErr) => {
        if (logoutErr) console.error("Erro no logout:", logoutErr);
      });
      
      req.session.destroy((err) => {
        if (err) console.error("Erro ao destruir sessão:", err);
      });
      
      // Sempre retornar 401 JSON para APIs, exceto /api/login
      if (req.url.startsWith('/api/') && req.url !== '/api/login') {
        return res.status(401).json({ message: "Authentication failed", expired: true });
      }
      return res.redirect("/api/login");
    }
  }
  
  console.log("Usuário autenticado com sucesso:", user.claims?.sub);
  return next();
};
