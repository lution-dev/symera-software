// Autenticação simples para desenvolvimento
import type { Express, Request, Response } from "express";
import { storage } from "./storage";

// Middleware para verificação de autenticação de desenvolvimento
export const isDevAuthenticated = async (req: Request, res: Response, next: any) => {
  // Verificar se está usando autenticação de desenvolvimento
  if (req.session?.devIsAuthenticated && req.session?.devUserId) {
    try {
      const user = await storage.getUser(req.session.devUserId);
      if (user) {
        console.log("Usando autenticação de desenvolvimento para usuário:", user.id);
        return next();
      }
    } catch (error) {
      console.error("Erro ao verificar usuário dev:", error);
    }
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};

export const setupDevAuth = (app: Express) => {
  // Rota de login para desenvolvimento
  app.post("/api/dev/login", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }
      
      let user = await storage.getUserByEmail(email);
      
      // Se o usuário não existir, cria um
      if (!user) {
        user = await storage.findOrCreateUserByEmail(email);
      }
      
      if (user) {
        // Salvar na sessão que está usando autenticação de desenvolvimento
        req.session.devIsAuthenticated = true;
        req.session.devUserId = user.id;
        
        // Salvar a sessão e responder
        req.session.save((err) => {
          if (err) {
            console.error("Erro ao salvar sessão:", err);
            return res.status(500).json({ message: "Erro ao fazer login" });
          }
          return res.json({ success: true, user });
        });
      } else {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
    } catch (error) {
      console.error("Erro ao fazer login de desenvolvimento:", error);
      return res.status(500).json({ message: "Erro ao fazer login" });
    }
  });
  
  // Rota para obter dados do usuário autenticado
  app.get("/api/dev/auth/user", isDevAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.devUserId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      return res.json(user);
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      return res.status(500).json({ message: "Erro ao obter usuário" });
    }
  });
  
  // Rota de logout
  app.get("/api/dev/logout", (req: Request, res: Response) => {
    req.session.devIsAuthenticated = false;
    req.session.devUserId = undefined;
    
    req.session.save((err) => {
      if (err) {
        console.error("Erro ao salvar sessão:", err);
      }
      return res.redirect("/");
    });
  });
};