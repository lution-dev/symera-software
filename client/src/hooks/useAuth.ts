import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        const supabase = await getSupabase();
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        if (currentSession) {
          authManager.saveAuthData(currentSession);
        }
        
        unsubscribe = await authManager.setupAuthListener((newSession) => {
          setSession(newSession);
          if (newSession) {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          }
        });
        
        authManager.setupActivityTracker();
      } catch (error) {
        console.error('[Auth] Erro na inicialização:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [queryClient]);

  const { data: user, isLoading: isLoadingUser, error, refetch } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!session,
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
