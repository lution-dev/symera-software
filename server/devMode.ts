// Configuração e utilidades para o modo de desenvolvimento
import type { Request, Response, NextFunction } from "express";

// Middleware que apenas passa a requisição adiante sem fazer login automático
export const devModeAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Não faz nada, apenas passa a requisição adiante
  return next();
};

// Middleware de autenticação que verifica se o usuário está logado
export const ensureDevAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Verifica se o usuário está autenticado via Replit Auth
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Se não estiver autenticado, retorna 401
  return res.status(401).json({ message: "Unauthorized - Login Required" });
};