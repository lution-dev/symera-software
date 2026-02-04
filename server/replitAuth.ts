import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
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
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 dias em milissegundos
  
  // Usar PostgreSQL para persistir sessões - sobrevive a reinícios do servidor
  const PgSession = connectPg(session);
  const sessionStore = new PgSession({
    pool: pool as any, // Pool do Neon/Supabase
    tableName: 'session',
    createTableIfMissing: true, // Cria a tabela automaticamente
    pruneSessionInterval: 60 * 15, // Limpa sessões expiradas a cada 15 minutos
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'replit-session-secret-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity - crítico para persistência
    cookie: {
      httpOnly: true, // Mais seguro - sessões não precisam ser acessadas via JS
      secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
      sameSite: 'lax',
      maxAge: sessionTtl, // 30 dias
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

  // Rota para verificar e renovar sessão automaticamente
  app.post("/api/auth/refresh", async (req, res) => {
    console.log("Tentativa de renovação de sessão:");
    
    const user = req.user as any;
    
    if (!req.isAuthenticated() || !user) {
      console.log("- Usuário não autenticado para renovação");
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      
      // Se o token ainda é válido por mais de 5 minutos, não precisa renovar
      if (user.expires_at && now < (user.expires_at - 300)) {
        console.log("- Token ainda válido, não precisa renovar");
        return res.json({ 
          renewed: false, 
          expiresAt: user.expires_at,
          message: "Token still valid" 
        });
      }

      // Tentar renovar com refresh token
      if (user.refresh_token) {
        console.log("- Tentando renovar token com refresh token");
        const config = await getOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, user.refresh_token);
        updateUserSession(user, tokenResponse);
        
        // Salvar sessão atualizada
        await new Promise<void>((resolve) => {
          req.session.save(() => resolve());
        });
        
        console.log("- Token renovado com sucesso");
        return res.json({ 
          renewed: true, 
          expiresAt: user.expires_at,
          message: "Token refreshed successfully" 
        });
      }

      console.log("- Sem refresh token disponível");
      return res.status(401).json({ message: "No refresh token available" });

    } catch (error) {
      console.error("Erro ao renovar token:", error);
      return res.status(401).json({ message: "Token refresh failed" });
    }
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
  
  // Em desenvolvimento, permitir acesso se o middleware de dev autenticou
  if (process.env.NODE_ENV === 'development' && req.isAuthenticated()) {
    console.log("- Usuário autenticado em modo desenvolvimento");
    return next();
  }
  
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
  
  // Verificar expiração do token e tentar renovação automática
  const now = Math.floor(Date.now() / 1000);
  const tokenExpired = user.expires_at && now > user.expires_at;
  const tokenExpiringSoon = user.expires_at && now > (user.expires_at - 300); // 5 minutos antes
  
  if (tokenExpired || tokenExpiringSoon) {
    const action = tokenExpired ? "expirado" : "expirando em breve";
    console.log(`Token ${action}, tentando renovar automaticamente`);
    
    // Para uploads de documentos, permitir acesso mesmo com token expirado se ainda temos claims válidos
    if (req.url.includes('/documents') && req.method === 'POST' && !tokenExpired) {
      console.log("Upload de documento - permitindo com token próximo ao vencimento");
      return next();
    }
    
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      console.log("Refresh token não encontrado para renovação");
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ 
          message: "Session expired - please login again", 
          expired: true 
        });
      }
      return res.redirect("/api/login");
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      
      // Salvar sessão atualizada
      await new Promise<void>((resolve) => {
        req.session.save(() => resolve());
      });
      
      console.log("Token renovado automaticamente pelo middleware");
    } catch (error) {
      console.error("Erro ao renovar token no middleware:", error);
      
      // Limpar sessão completamente
      req.logout((logoutErr) => {
        if (logoutErr) console.error("Erro no logout:", logoutErr);
      });
      
      req.session.destroy((err) => {
        if (err) console.error("Erro ao destruir sessão:", err);
      });
      
      if (req.url.startsWith('/api/') && req.url !== '/api/login') {
        return res.status(401).json({ 
          message: "Authentication failed - please login again", 
          expired: true 
        });
      }
      return res.redirect("/api/login");
    }
  }
  
  console.log("Usuário autenticado com sucesso:", user.claims?.sub);
  return next();
};
