// Configuração e utilidades para o modo de desenvolvimento
import type { Request, Response, NextFunction } from "express";

// Middleware de login automático em desenvolvimento - DESABILITADO PARA TESTES
export const devModeAuth = async (req: Request, res: Response, next: NextFunction) => {
  // TEMPORARIAMENTE DESABILITADO - para testar o fluxo de autenticação correto
  /*
  // Se não está autenticado e está em desenvolvimento, fazer login automático
  if (!req.isAuthenticated() && process.env.NODE_ENV === 'development') {
    // Simular usuário logado
    const mockUser = {
      claims: {
        sub: '8650891',
        email: 'applution@gmail.com', 
        first_name: 'Dev',
        last_name: 'User',
        profile_image_url: undefined
      },
      access_token: 'dev-token',
      refresh_token: 'dev-refresh',
      expires_at: Date.now() + 86400000
    };

    // Fazer login do usuário
    req.logIn(mockUser, (err) => {
      if (err) {
        console.error('Erro no login de desenvolvimento:', err);
        return next();
      }
      console.log('Login de desenvolvimento realizado para:', mockUser.claims.email);
      return next();
    });
  } else {
    return next();
  }
  */
  
  // Simplesmente prosseguir sem fazer login automático
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