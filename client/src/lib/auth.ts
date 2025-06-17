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

  // Configura interceptor para atualizar atividade automaticamente
  setupActivityTracker(): void {
    // Atualiza atividade a cada requisição
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      this.updateActivity();
      return originalFetch.apply(window, args);
    };

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
}

export const authManager = AuthManager.getInstance();