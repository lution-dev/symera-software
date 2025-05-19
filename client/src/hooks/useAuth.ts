import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Função de logout - redireciona para a API de logout
  const logout = () => {
    // Adiciona um parâmetro para forçar o cache a ser ignorado
    window.location.href = "/api/logout?t=" + new Date().getTime();
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    refetch,
    logout
  };
}
