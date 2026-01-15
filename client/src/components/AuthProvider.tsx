import { useEffect, useState, useRef } from "react";
import { authManager } from "../lib/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    const initializeAuth = async () => {
      console.log('[AuthProvider] Inicializando sistema de autenticação...');
      
      // Configurar o sistema de atividade
      authManager.setupActivityTracker();
      
      // Verificar se há dados de autenticação válidos no localStorage
      const authData = authManager.getAuthData();
      
      if (authData) {
        console.log('[AuthProvider] Dados de autenticação encontrados');
        console.log('[AuthProvider] Usuario:', authData.userId);
      } else {
        console.log('[AuthProvider] Nenhum dado de autenticação encontrado');
      }
      
      setIsInitialized(true);
      console.log('[AuthProvider] Inicialização completa');
    };

    initializeAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}