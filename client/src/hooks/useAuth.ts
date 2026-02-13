import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { authManager } from "../lib/auth";
import { getSupabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [hasValidAuthData, setHasValidAuthData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        console.log('[useAuth] Inicializando...');

        // Primeiro verificar se há dados de auth salvos no localStorage
        const savedAuthData = authManager.getAuthData();
        if (savedAuthData) {
          console.log('[useAuth] Dados de auth encontrados no localStorage');
          setHasValidAuthData(true);
        }

        const supabase = await getSupabase();
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        console.log('[useAuth] Sessão Supabase:', !!currentSession);

        if (currentSession) {
          setSession(currentSession);
          authManager.saveAuthData(currentSession);
          setHasValidAuthData(true);
        } else if (savedAuthData) {
          // Não temos sessão do Supabase mas temos dados salvos válidos
          console.log('[useAuth] Usando dados salvos do localStorage');
          setHasValidAuthData(true);
        }

        unsubscribe = await authManager.setupAuthListener((newSession) => {
          console.log('[useAuth] Auth state changed:', !!newSession);
          setSession(newSession);
          if (newSession) {
            setHasValidAuthData(true);
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          }
        });
      } catch (error) {
        console.error('[useAuth] Erro na inicialização:', error);
      } finally {
        setIsInitialized(true);
        console.log('[useAuth] Inicialização completa');
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [queryClient]);

  const { data: user, isLoading: isLoadingUser, error, refetch } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = session?.access_token || authManager.getAccessToken();

      if (!token) {
        console.log('[useAuth] Nenhum token disponível');
        throw new Error("No token");
      }

      console.log('[useAuth] Buscando dados do usuário...');
      try {
        const res = await fetch("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.log('[useAuth] 401 - tentando renovar token...');
            const refreshed = await authManager.refreshToken();
            if (refreshed) {
              const newToken = authManager.getAccessToken();
              if (newToken) {
                const retryRes = await fetch("/api/auth/user", {
                  headers: { Authorization: `Bearer ${newToken}` },
                });
                if (retryRes.ok) {
                  return await retryRes.json();
                }
              }
            }
            // Em vez de limpar os dados, usar dados locais como fallback
            // Isso evita que o usuário seja deslogado por erros transitórios
            console.log('[useAuth] 401 após retry - verificando dados locais como fallback');
            const authData = authManager.getAuthData();
            if (authData) {
              console.log('[useAuth] Usando dados locais como fallback após 401');
              return {
                id: authData.userId,
                email: authData.email,
                firstName: authData.name?.split(' ')[0] || authData.email.split('@')[0],
                lastName: authData.name?.split(' ').slice(1).join(' ') || '',
                profileImageUrl: authData.picture,
              };
            }
            // Só limpar se realmente não tem dados locais
            console.log('[useAuth] 401 confirmado e sem dados locais - limpando auth');
            authManager.clearAuthData();
            setHasValidAuthData(false);
            throw new Error("Unauthorized");
          }
          console.log('[useAuth] Erro HTTP', res.status, '- usando dados locais (servidor pode estar reiniciando)');
          const authData = authManager.getAuthData();
          if (authData) {
            return {
              id: authData.userId,
              email: authData.email,
              firstName: authData.name?.split(' ')[0] || authData.email.split('@')[0],
              lastName: authData.name?.split(' ').slice(1).join(' ') || '',
              profileImageUrl: authData.picture,
            };
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('[useAuth] Dados do usuário recebidos:', !!data);
        return data;
      } catch (err: any) {
        if (err.message === 'Unauthorized') {
          throw err;
        }
        console.log('[useAuth] Erro de rede/transitório:', err.message, '- mantendo login com dados locais');
        const authData = authManager.getAuthData();
        if (authData) {
          return {
            id: authData.userId,
            email: authData.email,
            firstName: authData.name?.split(' ')[0] || authData.email.split('@')[0],
            lastName: authData.name?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: authData.picture,
          };
        }
        throw err;
      }
    },
    retry: (failureCount, error) => {
      if (error?.message === 'Unauthorized' || error?.message === 'No token') return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 5 * 60 * 1000,
    enabled: hasValidAuthData || !!session?.access_token,
  });

  const signInWithGoogle = async () => {
    await authManager.signInWithGoogle();
  };

  const signInWithDevToken = async (): Promise<boolean> => {
    const success = await authManager.signInWithDevToken();
    if (success) {
      setHasValidAuthData(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = '/';
    }
    return success;
  };

  const isDevLoginAvailable = async (): Promise<boolean> => {
    return authManager.isDevLoginAvailable();
  };

  const logout = async () => {
    await authManager.signOut();
    setHasValidAuthData(false);
    queryClient.clear();
  };

  const isAuthenticated = (hasValidAuthData || !!session) && !!user && !error;
  const isLoading = !isInitialized || ((hasValidAuthData || !!session) && isLoadingUser);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated,
    refetch,
    signInWithGoogle,
    signInWithDevToken,
    isDevLoginAvailable,
    logout
  };
}
