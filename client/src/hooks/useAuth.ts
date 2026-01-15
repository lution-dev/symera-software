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
      // Usar token da sessão Supabase ou do localStorage
      const token = session?.access_token || authManager.getAccessToken();
      
      if (!token) {
        console.log('[useAuth] Nenhum token disponível');
        throw new Error("No token");
      }
      
      console.log('[useAuth] Buscando dados do usuário...');
      const res = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.log('[useAuth] 401 - não autorizado');
          authManager.clearAuthData();
          setHasValidAuthData(false);
          throw new Error("Unauthorized");
        }
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('[useAuth] Dados do usuário recebidos:', !!data);
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: hasValidAuthData || !!session?.access_token,
  });

  const signInWithGoogle = async () => {
    await authManager.signInWithGoogle();
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
    logout
  };
}
