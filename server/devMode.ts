// Configuração e utilidades para o modo de desenvolvimento
import type { Request, Response, NextFunction } from "express";

// Middleware de login automático em desenvolvimento - DESATIVADO para segurança
export const devModeAuth = async (req: Request, res: Response, next: NextFunction) => {
  // DESATIVADO: Não fazer login automático para manter segurança
  // Apenas passar para o próximo middleware
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