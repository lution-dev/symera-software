import { useEffect, useState } from "react";
import { authManager } from "../lib/auth";
import { useAuth } from "../hooks/useAuth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { refetch } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthProvider] Inicializando sistema de autenticação...');
      
      // Configurar o sistema de atividade e renovação automática
      authManager.setupActivityTracker();
      
      // Verificar se há dados de autenticação válidos no localStorage
      const authData = authManager.getAuthData();
      
      if (authData) {
        console.log('[AuthProvider] Dados de autenticação encontrados no localStorage');
        console.log('[AuthProvider] Usuario:', authData.userId);
        console.log('[AuthProvider] Expira em:', new Date(authData.expiresAt).toLocaleString());
        
        // Tentar validar a sessão com o servidor
        try {
          await refetch();
          console.log('[AuthProvider] Sessão validada com sucesso');
        } catch (error) {
          console.log('[AuthProvider] Erro ao validar sessão:', error);
          // Não limpar os dados ainda, deixar o sistema de interceptação lidar com isso
        }
      } else {
        console.log('[AuthProvider] Nenhum dado de autenticação encontrado no localStorage');
      }
      
      setIsInitialized(true);
    };

    initializeAuth();
  }, [refetch]);

  // Mostrar loading enquanto inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}