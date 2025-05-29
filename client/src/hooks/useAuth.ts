import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Função de logout - redireciona para a API de logout
  const logout = () => {
    window.location.href = "/api/logout";
  };

  // Determinar se está autenticado: precisa ter user E não ter erro
  const isAuthenticated = !!user && !error;

  // Se há erro de 401/403 ou não há user, definitivamente não está autenticado
  const isUnauthenticated = !user || (error && (error as any)?.status === 401);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: isAuthenticated && !isUnauthenticated,
    refetch,
    logout
  };
}
