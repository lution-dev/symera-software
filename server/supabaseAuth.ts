import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import memorystore from "memorystore";
import { storage } from "./storage";

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

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("[Auth] Token não fornecido no header Authorization");
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.substring(7);

  try {
    // Decodificar o JWT para extrair claims diretamente
    // O token do Supabase é um JWT válido que podemos decodificar
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
    const userId = payload.sub;
    const email = payload.email;
    const userMetadata = payload.user_metadata || {};

    if (!userId) {
      console.log("[Auth] Token não contém user ID");
      return res.status(401).json({ message: "Unauthorized - No user ID in token" });
    }

    (req as any).user = {
      claims: {
        sub: userId,
        email: email,
        name: userMetadata.full_name || userMetadata.name || email?.split('@')[0],
        picture: userMetadata.avatar_url || userMetadata.picture,
      }
    };

    console.log("[Auth] Usuário autenticado:", userId, email);
    return next();
  } catch (error: any) {
    console.error("[Auth] Erro ao verificar token:", error.message);
    return res.status(401).json({ message: "Unauthorized - Token verification failed" });
  }
};
