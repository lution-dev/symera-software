import type { Express, RequestHandler } from "express";
import session from "express-session";
import memorystore from "memorystore";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 dias
  
  const MemoryStore = memorystore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'temp-session-secret-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export function setupTempAuth(app: Express) {
  // Configurar sessão
  app.use(getSession());
  
  // Rota de login temporário
  app.post('/api/auth/temp-login', async (req, res) => {
    try {
      // Criar usuário de teste se não existir
      let user = await storage.getUserById('temp-user-123');
      
      if (!user) {
        user = await storage.createUser({
          id: 'temp-user-123',
          email: 'usuario@teste.com',
          firstName: 'Usuário',
          lastName: 'Teste',
          phone: '+55 (11) 99999-9999',
          profileImageUrl: 'https://via.placeholder.com/150',
        });
      }
      
      // Fazer login na sessão
      req.session.user = user;
      req.session.save((err) => {
        if (err) {
          console.error('Erro ao salvar sessão:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        
        console.log('Login temporário realizado com sucesso para:', user.id);
        res.json({ user, message: 'Login realizado com sucesso' });
      });
      
    } catch (error) {
      console.error('Erro no login temporário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
  
  // Rota para verificar usuário autenticado
  app.get('/api/auth/user', (req, res) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Unauthorized - Login Required" });
    }
  });
  
  // Rota de logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao fazer logout:', err);
        return res.status(500).json({ message: 'Erro ao fazer logout' });
      }
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  console.log('Verificando autenticação do usuário:');
  console.log('- Session ID:', req.sessionID);
  console.log('- Is Authenticated:', !!req.session.user);
  
  if (req.session.user) {
    console.log('- Usuário autenticado:', req.session.user.id);
    console.log('ID do usuário salvo na sessão:', req.session.user.id);
    console.log('Usuário autenticado com sucesso:', req.session.user.id);
    next();
  } else {
    console.log('- Usuário não autenticado');
    res.status(401).json({ message: "Unauthorized - Login Required" });
  }
};