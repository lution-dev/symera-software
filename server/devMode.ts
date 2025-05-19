// Configuração e utilidades para o modo de desenvolvimento
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// ID de usuário fixo para o ambiente de desenvolvimento - usuário existente no banco de dados
const DEV_USER_ID = "8650891";
// Email do usuário para usar no ambiente de desenvolvimento
const DEV_USER_EMAIL = "applution@gmail.com";

// Middleware para ativar autenticação automática no ambiente de desenvolvimento
export const devModeAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Se for ambiente de desenvolvimento ou preview e estiver dentro do Replit
  if ((process.env.NODE_ENV === 'development' || process.env.REPL_ID) && isReplitEnvironment(req)) {
    // Primeiramente, verificar se o usuário com o email especificado já existe
    const existingUserByEmail = await storage.getUserByEmail(DEV_USER_EMAIL);
    
    if (existingUserByEmail) {
      console.log(`Usando usuário existente com email ${DEV_USER_EMAIL}...`);
      
      // Atualizar todos os dados do perfil para garantir que estejam completos
      await storage.upsertUser({
        id: existingUserByEmail.id,
        email: DEV_USER_EMAIL,
        firstName: "Usuário",
        lastName: "Desenvolvimento",
        phone: "+55 (11) 99999-9999",
        profileImageUrl: "https://i.pravatar.cc/300",
        updatedAt: new Date(),
      });
      
      // Definir o ID do usuário existente para a sessão
      req.session.devUserId = existingUserByEmail.id;
      req.session.devIsAuthenticated = true;
    } else {
      // Se não existe um usuário com esse email, verificar se temos o usuário de dev padrão
      const existingUser = await storage.getUser(DEV_USER_ID);
      
      if (!existingUser) {
        // Criar um novo usuário com o email específico e todos os dados do perfil
        console.log(`Criando usuário de desenvolvimento com email ${DEV_USER_EMAIL}...`);
        await storage.upsertUser({
          id: DEV_USER_ID,
          email: DEV_USER_EMAIL,
          firstName: "Usuário",
          lastName: "Desenvolvimento",
          phone: "+55 (11) 99999-9999", 
          profileImageUrl: "https://i.pravatar.cc/300",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Atualizar usuário existente para garantir que todos os dados do perfil estejam presentes
        await storage.upsertUser({
          id: DEV_USER_ID,
          email: DEV_USER_EMAIL,
          firstName: "Usuário",
          lastName: "Desenvolvimento",
          phone: "+55 (11) 99999-9999",
          profileImageUrl: "https://i.pravatar.cc/300",
          updatedAt: new Date(),
        });
      }
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

// Verifica se a requisição vem do ambiente Replit "interno"
function isReplitEnvironment(req: Request): boolean {
  // Verificar se há o parâmetro que indica "visitante" na query
  if (req.query.visitor === 'true' || req.query.visitante === 'true') {
    return false;
  }
  
  // Verificar agente do usuário - um indicador de acesso externo vs. interno
  const userAgent = req.headers['user-agent'] || '';
  if (userAgent.includes('Chrome') || userAgent.includes('Firefox') || userAgent.includes('Safari')) {
    // Se tiver um user-agent de navegador normal, assumir que é acesso externo
    return false;
  }
  
  // Verificar headers de referência
  if (req.headers.referer && req.headers.referer.includes('?visitante=true')) {
    return false;
  }
  
  // No caso de dúvidas, verificar se a requisição vem dos endereços internos do Replit
  return Boolean(process.env.REPL_ID) && Boolean(
    req.hostname === 'localhost' || 
    req.hostname.includes('0.0.0.0') ||
    (req.ip && req.ip === '127.0.0.1') ||
    (req.ip && req.ip.startsWith('10.')) ||
    (req.ip && req.ip.startsWith('172.')) ||
    req.headers['x-forwarded-for'] === '127.0.0.1'
  );
}

// Middleware para garantir autenticação no modo dev
export const ensureDevAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Verificar autenticação em desenvolvimento apenas se for ambiente Replit interno
  if ((process.env.NODE_ENV === 'development' || process.env.REPL_ID) && isReplitEnvironment(req)) {
    if (req.session.devUserId && req.session.devIsAuthenticated) {
      const user = await storage.getUser(req.session.devUserId);
      if (user) {
        // Garantir que o usuário tem todos os campos preenchidos
        if (!user.firstName || !user.lastName || !user.phone || !user.profileImageUrl) {
          await storage.upsertUser({
            id: user.id,
            email: user.email || "applution@gmail.com",
            firstName: user.firstName || "Usuário",
            lastName: user.lastName || "Desenvolvimento",
            phone: user.phone || "+55 (11) 99999-9999",
            profileImageUrl: user.profileImageUrl || "https://i.pravatar.cc/300",
            updatedAt: new Date(),
          });
        }
        return next();
      }
    }
    
    // Se não estiver autenticado, criar/atualizar sessão
    req.session.devUserId = DEV_USER_ID;
    req.session.devIsAuthenticated = true;
    
    // Garantir que o usuário de desenvolvimento exista e tenha todos os dados
    const devUser = await storage.getUser(DEV_USER_ID);
    if (!devUser) {
      await storage.upsertUser({
        id: DEV_USER_ID,
        email: DEV_USER_EMAIL,
        firstName: "Usuário",
        lastName: "Desenvolvimento",
        phone: "+55 (11) 99999-9999",
        profileImageUrl: "https://i.pravatar.cc/300",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (!devUser.firstName || !devUser.lastName || !devUser.phone || !devUser.profileImageUrl) {
      // Atualizar se faltar algum campo
      await storage.upsertUser({
        id: DEV_USER_ID,
        email: devUser.email || DEV_USER_EMAIL,
        firstName: devUser.firstName || "Usuário",
        lastName: devUser.lastName || "Desenvolvimento",
        phone: devUser.phone || "+55 (11) 99999-9999",
        profileImageUrl: devUser.profileImageUrl || "https://i.pravatar.cc/300",
        updatedAt: new Date(),
      });
    }
    
    await new Promise<void>((resolve) => {
      req.session.save(() => resolve());
    });
    
    return next();
  }
  
  // Em produção, prosseguir normalmente
  return next();
};