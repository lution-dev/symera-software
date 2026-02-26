import { getSupabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

const AUTH_STORAGE_KEY = 'symera_auth_data';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface AuthData {
  userId: string;
  email: string;
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
  name?: string;
  picture?: string;
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
    const userMetadata = session.user.user_metadata || {};
    const authData: AuthData = {
      userId: session.user.id,
      email: session.user.email || '',
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: Date.now() + THIRTY_DAYS_MS,
      name: userMetadata.full_name || userMetadata.name || session.user.email?.split('@')[0],
      picture: userMetadata.avatar_url || userMetadata.picture,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    console.log('[Auth] Dados de autenticação salvos (30 dias):', authData.email);
  }

  saveAuthDataWithServerId(session: Session, serverId: string): void {
    const userMetadata = session.user.user_metadata || {};
    const authData: AuthData = {
      userId: serverId,
      email: session.user.email || '',
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: Date.now() + THIRTY_DAYS_MS,
      name: userMetadata.full_name || userMetadata.name || session.user.email?.split('@')[0],
      picture: userMetadata.avatar_url || userMetadata.picture,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    console.log('[Auth] Dados salvos com ID do servidor (30 dias):', serverId);
  }

  async refreshToken(): Promise<boolean> {
    try {
      console.log('[Auth] Tentando renovar token...');

      // Preservar o server ID existente antes de renovar
      const existingData = this.getAuthData();
      const existingServerId = existingData?.userId;

      const supabase = await getSupabase();

      // Primeiro tenta obter a sessão atual (pode ter refresh automático)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        console.log('[Auth] Sessão válida encontrada via getSession');
        // Preservar o server ID se existir
        if (existingServerId && existingServerId !== sessionData.session.user.id) {
          this.saveAuthDataWithServerId(sessionData.session, existingServerId);
        } else {
          this.saveAuthData(sessionData.session);
        }
        return true;
      }

      // Se não tem sessão, tenta refresh explícito
      const { data, error } = await supabase.auth.refreshSession();

      if (error || !data.session) {
        console.log('[Auth] Falha ao renovar token:', error?.message);
        return false;
      }

      console.log('[Auth] Token renovado com sucesso via refreshSession');
      // Preservar o server ID se existir
      if (existingServerId && existingServerId !== data.session.user.id) {
        this.saveAuthDataWithServerId(data.session, existingServerId);
      } else {
        this.saveAuthData(data.session);
      }
      return true;
    } catch (error) {
      console.error('[Auth] Erro ao renovar token:', error);
      return false;
    }
  }

  getAuthData(): AuthData | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const authData: AuthData = JSON.parse(stored);
      return authData;
    } catch (error) {
      console.error('[Auth] Erro ao recuperar dados:', error);
      this.clearAuthData();
      return null;
    }
  }

  async getAuthDataWithRefresh(): Promise<AuthData | null> {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const authData: AuthData = JSON.parse(stored);
      const now = Date.now();

      if (now > authData.expiresAt) {
        console.log('[Auth] Dados locais expiraram, tentando renovar...');
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          this.clearAuthData();
          return null;
        }
        return this.getAuthData();
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
          console.log('[Auth] Usuário fez logout, limpando dados');
          this.clearAuthData();
          callback(null);
        } else {
          const savedData = this.getAuthData();
          if (savedData) {
            console.log('[Auth] Evento', event, 'sem sessão, mas temos dados locais - mantendo login');
          } else {
            console.log('[Auth] Evento', event, 'sem sessão e sem dados salvos');
            callback(null);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }

  setupActivityTracker(): void {
    // O tratamento de 401 agora é feito no queryClient.ts (apiRequest e getQueryFn)
    // Este método existe apenas para compatibilidade
    console.log('[Auth] Activity tracker inicializado (tratamento de 401 centralizado no queryClient)');
  }
}

export const authManager = AuthManager.getInstance();
