// Configuração e utilidades para o modo de desenvolvimento
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// ID de usuário fixo para o ambiente de desenvolvimento
const DEV_USER_ID = "dev-123456789";

// Middleware para ativar autenticação automática no ambiente de desenvolvimento
export const devModeAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Se for ambiente de desenvolvimento ou preview
  if (process.env.NODE_ENV === 'development' || process.env.REPL_ID) {
    // Verificar se o usuário já existe, senão criar
    const existingUser = await storage.getUser(DEV_USER_ID);
    
    if (!existingUser) {
      console.log("Criando usuário de desenvolvimento...");
      await storage.upsertUser({
        id: DEV_USER_ID,
        email: "dev@example.com",
        firstName: "Usuário",
        lastName: "Desenvolvimento",
        profileImageUrl: "https://i.pravatar.cc/300",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Definir o usuário na sessão
    if (!req.session.devUserId) {
      req.session.devUserId = DEV_USER_ID;
      req.session.devIsAuthenticated = true;
      await new Promise<void>((resolve) => {
        req.session.save(() => resolve());
      });
    }
  }
  
  return next();
};

// Middleware para garantir autenticação no modo dev
export const ensureDevAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Verificar autenticação em desenvolvimento
  if (process.env.NODE_ENV === 'development' || process.env.REPL_ID) {
    if (req.session.devUserId && req.session.devIsAuthenticated) {
      const user = await storage.getUser(req.session.devUserId);
      if (user) {
        return next();
      }
    }
    
    // Se não estiver autenticado, criar/atualizar sessão
    req.session.devUserId = DEV_USER_ID;
    req.session.devIsAuthenticated = true;
    await new Promise<void>((resolve) => {
      req.session.save(() => resolve());
    });
    
    return next();
  }
  
  // Em produção, prosseguir normalmente
  return next();
};