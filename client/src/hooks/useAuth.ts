import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authManager } from "../lib/auth";
import { supabase } from "../lib/supabase";
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        authManager.saveAuthData(session);
      }
      setIsInitialized(true);
    });

    const unsubscribe = authManager.setupAuthListener((newSession) => {
      setSession(newSession);
      if (newSession) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    });

    authManager.setupActivityTracker();

    return unsubscribe;
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
