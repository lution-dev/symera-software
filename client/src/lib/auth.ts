import { getSupabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

const AUTH_STORAGE_KEY = 'symera_auth_data';

interface AuthData {
  userId: string;
  email: string;
  accessToken: string;
  expiresAt: number;
}

export class AuthManager {
  private static instance: AuthManager;
  
  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async signInWithGoogle(): Promise<void> {
    const supabase = await getSupabase();
    
    // Determinar a URL de callback correta
    const origin = window.location.origin;
    const redirectUrl = origin + '/auth/callback';
    
    console.log('[Auth] Iniciando login com Google');
    console.log('[Auth] Origin:', origin);
    console.log('[Auth] Redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('[Auth] Erro ao fazer login com Google:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    this.clearAuthData();
    window.location.href = '/auth';
  }

  async getSession(): Promise<Session | null> {
    const supabase = await getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async getUser(): Promise<User | null> {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  saveAuthData(session: Session): void {
    const authData: AuthData = {
      userId: session.user.id,
      email: session.user.email || '',
      accessToken: session.access_token,
      expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    console.log('[Auth] Dados de autenticação salvos');
  }

  getAuthData(): AuthData | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const authData: AuthData = JSON.parse(stored);
      const now = Date.now();

      if (now > authData.expiresAt) {
        console.log('[Auth] Token expirado');
        this.clearAuthData();
        return null;
      }

      return authData;
    } catch (error) {
      console.error('[Auth] Erro ao recuperar dados:', error);
      this.clearAuthData();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getAuthData() !== null;
  }

  clearAuthData(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('[Auth] Dados de autenticação limpos');
  }

  getUserId(): string | null {
    const authData = this.getAuthData();
    return authData?.userId || null;
  }

  getAccessToken(): string | null {
    const authData = this.getAuthData();
    return authData?.accessToken || null;
  }

  async setupAuthListener(callback: (session: Session | null) => void): Promise<() => void> {
    const supabase = await getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Estado mudou:', event, session ? 'com sessão' : 'sem sessão');
        
        if (session) {
          this.saveAuthData(session);
          callback(session);
        } else if (event === 'SIGNED_OUT') {
          // Só limpar dados quando o usuário faz logout explícito
          console.log('[Auth] Usuário fez logout, limpando dados');
          this.clearAuthData();
          callback(null);
        } else if (event === 'INITIAL_SESSION') {
          // INITIAL_SESSION sem sessão: verificar se temos dados salvos
          const savedData = this.getAuthData();
          if (savedData) {
            console.log('[Auth] INITIAL_SESSION sem sessão mas temos dados salvos, mantendo');
            // Não limpar - os dados foram salvos pelo callback
          } else {
            console.log('[Auth] INITIAL_SESSION sem sessão e sem dados salvos');
            callback(null);
          }
        } else {
          // Outros eventos sem sessão
          console.log('[Auth] Evento', event, 'sem sessão');
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }

  setupActivityTracker(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch.apply(window, args);
        
        if (response.status === 401 && !window.location.pathname.includes('/auth')) {
          console.log('[Auth] 401 detectado, redirecionando...');
          this.clearAuthData();
          window.location.href = '/auth';
        }
        
        return response;
      } catch (error) {
        console.error('[Auth] Erro na requisição:', error);
        throw error;
      }
    };
  }
}

export const authManager = AuthManager.getInstance();
