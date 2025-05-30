// Configuração e utilidades para o modo de desenvolvimento
import type { Request, Response, NextFunction } from "express";

// Middleware de login manual em desenvolvimento
export const devModeAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Verificar se já está autenticado via Replit
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Verificar se há uma sessão de desenvolvimento ativa
  if (req.session && (req.session as any).devIsAuthenticated) {
    return next();
  }
  
  // Se não está autenticado, apenas continuar
  return next();
};

// Middleware de autenticação que verifica se o usuário está logado
export const ensureDevAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Verifica se o usuário está autenticado
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Se não estiver autenticado, retorna 401
  return res.status(401).json({ message: "Unauthorized - Login Required" });
};