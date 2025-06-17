// Sistema de autenticação com persistência de longa duração
// Mantém o usuário logado por até 30 dias usando localStorage

interface AuthData {
  sessionId: string;
  userId: string;
  email: string;
  expiresAt: number;
  lastActivity: number;
}

const AUTH_STORAGE_KEY = 'symera_auth_data';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 dias em milissegundos

export class AuthManager {
  private static instance: AuthManager;
  
  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Salva dados de autenticação no localStorage
  saveAuthData(authData: Partial<AuthData>): void {
    const now = Date.now();
    const existingData = this.getAuthData();
    
    const newAuthData: AuthData = {
      sessionId: authData.sessionId || existingData?.sessionId || '',
      userId: authData.userId || existingData?.userId || '',
      email: authData.email || existingData?.email || '',
      expiresAt: now + SESSION_DURATION,
      lastActivity: now,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthData));
    console.log('[Auth] Dados de autenticação salvos:', { 
      userId: newAuthData.userId, 
      expiresAt: new Date(newAuthData.expiresAt).toISOString() 
    });
  }

  // Recupera dados de autenticação do localStorage
  getAuthData(): AuthData | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const authData: AuthData = JSON.parse(stored);
      const now = Date.now();

      // Verifica se o token expirou
      if (now > authData.expiresAt) {
        console.log('[Auth] Token expirado, removendo dados');
        this.clearAuthData();
        return null;
      }

      return authData;
    } catch (error) {
      console.error('[Auth] Erro ao recuperar dados de autenticação:', error);
      this.clearAuthData();
      return null;
    }
  }

  // Atualiza a última atividade para manter a sessão ativa
  updateActivity(): void {
    const authData = this.getAuthData();
    if (authData) {
      const now = Date.now();
      authData.lastActivity = now;
      authData.expiresAt = now + SESSION_DURATION; // Estende a expiração
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    }
  }

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    const authData = this.getAuthData();
    return authData !== null;
  }

  // Limpa dados de autenticação
  clearAuthData(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('[Auth] Dados de autenticação limpos');
  }

  // Obtém o ID do usuário
  getUserId(): string | null {
    const authData = this.getAuthData();
    return authData?.userId || null;
  }

  // Tenta renovar o token automaticamente
  async refreshToken(): Promise<boolean> {
    try {
      console.log('[Auth] Tentando renovar token...');
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[Auth] Token renovado:', result.message);
        this.updateActivity(); // Atualiza a atividade após renovação bem-sucedida
        return true;
      } else {
        console.log('[Auth] Falha na renovação do token');
        return false;
      }
    } catch (error) {
      console.error('[Auth] Erro ao renovar token:', error);
      return false;
    }
  }

  // Configura interceptor para atualizar atividade e renovar tokens automaticamente
  setupActivityTracker(): void {
    // Intercepta todas as requisições fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      this.updateActivity();
      
      try {
        const response = await originalFetch.apply(window, args);
        
        // Se recebeu 401, tenta renovar token uma vez
        if (response.status === 401 && this.isAuthenticated()) {
          console.log('[Auth] 401 detectado, tentando renovar token...');
          const renewed = await this.refreshToken();
          
          if (renewed) {
            // Reexecuta a requisição original após renovação
            console.log('[Auth] Token renovado, reexecutando requisição...');
            return originalFetch.apply(window, args);
          } else {
            // Se não conseguiu renovar, limpa dados e redireciona
            console.log('[Auth] Não foi possível renovar token, fazendo logout...');
            this.clearAuthData();
            window.location.href = '/auth';
          }
        }
        
        return response;
      } catch (error) {
        console.error('[Auth] Erro na requisição:', error);
        throw error;
      }
    };

    // Configura renovação automática periódica
    this.setupPeriodicTokenRefresh();

    // Atualiza atividade periodicamente enquanto o usuário está ativo
    let activityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        this.updateActivity();
      }, 5 * 60 * 1000); // A cada 5 minutos
    };

    // Eventos que indicam atividade do usuário
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();
  }

  // Configura renovação automática de tokens
  private setupPeriodicTokenRefresh(): void {
    // Verifica e renova tokens a cada 10 minutos
    setInterval(async () => {
      if (this.isAuthenticated()) {
        const authData = this.getAuthData();
        if (authData) {
          const now = Date.now();
          const timeUntilExpiry = authData.expiresAt - now;
          
          // Se o token expira em menos de 15 minutos, tenta renovar
          if (timeUntilExpiry < 15 * 60 * 1000) {
            console.log('[Auth] Token expira em breve, renovando...');
            const renewed = await this.refreshToken();
            
            if (!renewed) {
              console.log('[Auth] Falha na renovação automática, fazendo logout...');
              this.clearAuthData();
              window.location.href = '/auth';
            }
          }
        }
      }
    }, 10 * 60 * 1000); // A cada 10 minutos
  }
}

export const authManager = AuthManager.getInstance();