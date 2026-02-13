import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import memorystore from "memorystore";
import { storage } from "./storage";

// Cache para mapear email -> ID original do banco
const emailToUserIdCache = new Map<string, { userId: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getEffectiveUserId(email: string, supabaseUserId: string): Promise<string> {
  // Verificar cache primeiro
  const cached = emailToUserIdCache.get(email);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.userId;
  }

  // Buscar usuário pelo email no banco de dados
  const dbStorage = await storage;
  const existingUser = await dbStorage.getUserByEmail(email);

  if (existingUser) {
    // Usuário existente - usar ID original do banco
    emailToUserIdCache.set(email, { userId: existingUser.id, timestamp: Date.now() });
    return existingUser.id;
  }

  // Usuário novo - usar UUID do Supabase
  emailToUserIdCache.set(email, { userId: supabaseUserId, timestamp: Date.now() });
  return supabaseUserId;
}

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials not configured");
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000;

  const MemoryStore = memorystore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000,
  });

  return session({
    secret: process.env.SESSION_SECRET || 'supabase-session-secret-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupSupabaseAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.get("/api/supabase-config", (req, res) => {
    res.json({
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
    });
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error("Erro ao destruir sessão:", err);
      res.redirect("/auth");
    });
  });
}

// Token especial para desenvolvimento - só funciona quando NODE_ENV !== 'production'
const DEV_TOKEN_PREFIX = 'dev-token-';
const DEV_USER_ID = '8650891';
const DEV_USER_EMAIL = 'dev@symera.test';
const DEV_USER_NAME = 'Usuário de Teste';

export function generateDevToken(): string {
  const payload = {
    sub: DEV_USER_ID,
    email: DEV_USER_EMAIL,
    name: DEV_USER_NAME,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 dias
    iat: Math.floor(Date.now() / 1000),
    is_dev: true
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `${DEV_TOKEN_PREFIX}${payloadBase64}`;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("[Auth] Token não fornecido no header Authorization");
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.substring(7);

  // Verificar se é um token de desenvolvimento
  if (token.startsWith(DEV_TOKEN_PREFIX)) {
    if (process.env.NODE_ENV === 'production') {
      console.log("[Auth] Token de desenvolvimento rejeitado em produção");
      return res.status(401).json({ message: "Unauthorized - Dev tokens not allowed in production" });
    }

    try {
      const payloadBase64 = token.substring(DEV_TOKEN_PREFIX.length);
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

      if (!payload.is_dev) {
        return res.status(401).json({ message: "Unauthorized - Invalid dev token" });
      }

      console.log("[Auth] 🔧 Token de DESENVOLVIMENTO aceito - UserId:", payload.sub);

      (req as any).user = {
        claims: {
          sub: payload.sub,
          supabaseId: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: null,
        }
      };

      return next();
    } catch (error) {
      console.log("[Auth] Token de desenvolvimento inválido");
      return res.status(401).json({ message: "Unauthorized - Invalid dev token format" });
    }
  }

  try {
    // Decodificar o JWT para extrair claims diretamente
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("[Auth] Token JWT inválido - formato incorreto");
      return res.status(401).json({ message: "Unauthorized - Invalid token format" });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Verificar expiração
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log("[Auth] Token expirado");
      return res.status(401).json({ message: "Unauthorized - Token expired" });
    }

    // Extrair dados do usuário do payload do JWT
    const supabaseUserId = payload.sub;
    const email = payload.email;
    const userMetadata = payload.user_metadata || {};

    if (!supabaseUserId) {
      console.log("[Auth] Token não contém user ID");
      return res.status(401).json({ message: "Unauthorized - No user ID in token" });
    }

    if (!email) {
      console.log("[Auth] Token não contém email");
      return res.status(401).json({ message: "Unauthorized - No email in token" });
    }

    // IMPORTANTE: Resolver o ID efetivo baseado no email
    // Se o usuário já existe no banco, usa o ID original
    // Se é usuário novo, usa o UUID do Supabase
    const effectiveUserId = await getEffectiveUserId(email, supabaseUserId);

    console.log("[Auth] Resolução de ID - Supabase UUID:", supabaseUserId, "-> ID efetivo:", effectiveUserId, "Email:", email);

    (req as any).user = {
      claims: {
        sub: effectiveUserId, // Usar o ID efetivo (original do banco ou UUID)
        supabaseId: supabaseUserId, // Manter o UUID original caso precise
        email: email,
        name: userMetadata.full_name || userMetadata.name || email?.split('@')[0],
        picture: userMetadata.avatar_url || userMetadata.picture,
      }
    };

    return next();
  } catch (error: any) {
    console.error("[Auth] Erro ao verificar token:", error.message);
    return res.status(401).json({ message: "Unauthorized - Token verification failed" });
  }
};
