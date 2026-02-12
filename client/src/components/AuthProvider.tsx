import { useEffect, useState, useRef } from "react";
import { authManager } from "../lib/auth";
import { getSupabase } from "../lib/supabase";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    const fetchServerIdWithRetry = async (session: any, maxRetries = 3): Promise<string | null> => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch('/api/auth/user', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          if (response.ok) {
            const serverUser = await response.json();
            return serverUser.id;
          }
          if (response.status === 401) return null;
        } catch {
        }
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`[AuthProvider] Servidor indisponível, tentando novamente em ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      return null;
    };

    const initializeAuth = async () => {
      console.log('[AuthProvider] Inicializando sistema de autenticação...');
      
      const supabase = await getSupabase();
      let authData = authManager.getAuthData();
      
      if (authData) {
        console.log('[AuthProvider] Dados locais encontrados, verificando Supabase...');
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('[AuthProvider] Sessão Supabase válida, atualizando tokens...');
            const existingServerId = authData.userId;
            authManager.saveAuthDataWithServerId(session, existingServerId);
          } else {
            console.log('[AuthProvider] Sem sessão Supabase, tentando refresh...');
            await authManager.refreshToken();
          }
        } catch (error) {
          console.log('[AuthProvider] Erro ao verificar Supabase, mantendo dados locais (servidor pode estar reiniciando)');
        }
      } else {
        console.log('[AuthProvider] Nenhum dado local encontrado, verificando Supabase...');
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('[AuthProvider] Sessão Supabase encontrada, buscando server ID com retry...');
            const serverId = await fetchServerIdWithRetry(session);
            if (serverId) {
              authManager.saveAuthDataWithServerId(session, serverId);
              console.log('[AuthProvider] Dados sincronizados com server ID:', serverId);
            } else {
              authManager.saveAuthData(session);
              console.log('[AuthProvider] Salvando com Supabase ID (server indisponível temporariamente)');
            }
          } else {
            console.log('[AuthProvider] Nenhuma sessão Supabase encontrada');
          }
        } catch (error) {
          console.error('[AuthProvider] Erro ao verificar sessão Supabase:', error);
        }
      }
      
      setIsInitialized(true);
      console.log('[AuthProvider] Inicialização completa');
    };

    initializeAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}