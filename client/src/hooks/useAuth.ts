import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Função de logout - redireciona para a API de logout
  const logout = () => {
    window.location.href = "/api/logout";
  };

  // Se há erro (como 401), o usuário não está autenticado
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
