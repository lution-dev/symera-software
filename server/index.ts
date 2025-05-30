import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files statically
app.use('/uploads', express.static('public/uploads'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Middleware de proteção CRÍTICO - aplicado ANTES do Vite
  app.use((req, res, next) => {
    const url = req.originalUrl;
    
    // Permitir todas as rotas da API
    if (url.startsWith('/api/')) {
      return next();
    }
    
    // Permitir rota pública de feedback - ÚNICA EXCEÇÃO
    if (url.startsWith('/feedback/')) {
      return next();
    }
    
    // Permitir rota de login e auth
    if (url === '/login' || url.startsWith('/auth')) {
      return next();
    }
    
    // Permitir assets estáticos e recursos do Vite
    if (url.startsWith('/uploads/') || 
        url.startsWith('/assets/') || 
        url.startsWith('/@') || 
        url.startsWith('/src/') ||
        url.includes('.js') ||
        url.includes('.css') ||
        url.includes('.tsx') ||
        url.includes('.ts') ||
        url.includes('.map') ||
        url.includes('.ico') ||
        url.includes('.png') ||
        url.includes('.svg')) {
      return next();
    }
    
    // Para todas as outras rotas, verificar autenticação
    if (!req.isAuthenticated()) {
      console.log(`[SECURITY BLOCK] Bloqueando acesso não autorizado: ${url}`);
      return res.status(401).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login Necessário - Symera</title>
          <style>
            body { font-family: 'Sora', Arial, sans-serif; margin: 0; padding: 0; min-height: 100vh; 
                   background: linear-gradient(90deg, #FF8800 0%, #EC4130 100%); 
                   display: flex; align-items: center; justify-content: center; }
            .login-container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                              text-align: center; max-width: 400px; width: 90%; }
            .logo { font-size: 24px; font-weight: 700; color: #FF8800; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 30px; }
            button { background: linear-gradient(90deg, #FF8800 0%, #EC4130 100%); color: white; 
                    border: none; padding: 12px 30px; border-radius: 8px; font-size: 16px; 
                    cursor: pointer; font-weight: 600; }
            button:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="login-container">
            <div class="logo">🎯 Symera</div>
            <h1>Acesso Restrito</h1>
            <p>Você precisa estar logado para acessar esta página.</p>
            <button onclick="login()">Fazer Login</button>
          </div>
          <script>
            function login() {
              fetch('/api/auth/quick-login', { method: 'POST' })
                .then(response => response.json())
                .then(() => window.location.reload())
                .catch(() => alert('Erro no login'));
            }
          </script>
        </body>
        </html>
      `);
    }
    
    // Se autenticado, continuar
    next();
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
