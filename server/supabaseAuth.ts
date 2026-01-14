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
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("[Auth] Token inválido:", error?.message);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    (req as any).user = {
      claims: {
        sub: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      }
    };

    console.log("[Auth] Usuário autenticado:", user.id, user.email);
    return next();
  } catch (error) {
    console.error("[Auth] Erro ao verificar token:", error);
    return res.status(401).json({ message: "Unauthorized - Token verification failed" });
  }
};
