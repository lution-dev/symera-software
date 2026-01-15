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
        const supabase = await getSupabase();
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log('[useAuth] Sessão encontrada:', !!currentSession);
        
        setSession(currentSession);
        if (currentSession) {
          authManager.saveAuthData(currentSession);
        }
        
        unsubscribe = await authManager.setupAuthListener((newSession) => {
          console.log('[useAuth] Auth state changed:', !!newSession);
          setSession(newSession);
          if (newSession) {
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
      if (!session?.access_token) {
        throw new Error("No session");
      }
      
      console.log('[useAuth] Buscando dados do usuário...');
      const res = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.log('[useAuth] 401 - não autorizado');
          authManager.clearAuthData();
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
    enabled: !!session?.access_token,
  });

  const signInWithGoogle = async () => {
    await authManager.signInWithGoogle();
  };

  const logout = async () => {
    await authManager.signOut();
    queryClient.clear();
  };

  const isAuthenticated = !!session && !!user && !error;
  const isLoading = !isInitialized || (!!session && isLoadingUser);

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
