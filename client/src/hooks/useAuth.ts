import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { authManager } from "../lib/auth";

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Configura o sistema de persistência de autenticação
  useEffect(() => {
    // Inicializa o rastreador de atividade
    authManager.setupActivityTracker();

    // Se o usuário está autenticado, salva os dados no localStorage
    if (user && !error) {
      const userData = user as UserData;
      if (userData.id && userData.email) {
        authManager.saveAuthData({
          userId: userData.id,
          email: userData.email,
          sessionId: document.cookie.split(';').find(c => c.trim().startsWith('connect.sid='))?.split('=')[1] || '',
        });
      }
    }

    // Se houve erro 401 mas temos dados válidos no localStorage, tenta recuperar
    if (error && authManager.isAuthenticated()) {
      console.log('[Auth] Tentando recuperar sessão do localStorage');
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [user, error, refetch]);

  // Função de logout - limpa localStorage e redireciona
  const logout = () => {
    authManager.clearAuthData();
    window.location.href = "/api/logout";
  };

  // Se houve erro 401, significa que não está autenticado
  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    refetch,
    logout
  };
}
