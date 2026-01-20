import { useEffect, useState, useRef } from "react";
import { authManager } from "../lib/auth";
import { getSupabase } from "../lib/supabase";

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
      
      // Verificar se há dados de autenticação válidos no localStorage
      let authData = authManager.getAuthData();
      
      if (authData) {
        console.log('[AuthProvider] Dados de autenticação encontrados');
        console.log('[AuthProvider] Usuario:', authData.userId);
      } else {
        console.log('[AuthProvider] Nenhum dado local encontrado, verificando Supabase...');
        
        // Tentar recuperar sessão do Supabase
        try {
          const supabase = await getSupabase();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('[AuthProvider] Sessão Supabase encontrada, buscando server ID...');
            
            // Buscar server ID da API - obrigatório para consistência
            try {
              const response = await fetch('/api/auth/user', {
                headers: { Authorization: `Bearer ${session.access_token}` }
              });
              
              if (response.ok) {
                const serverUser = await response.json();
                authManager.saveAuthDataWithServerId(session, serverUser.id);
                authData = authManager.getAuthData();
                console.log('[AuthProvider] Dados sincronizados com server ID:', serverUser.id);
              } else {
                // Não salvar dados se não conseguir obter o server ID
                console.log('[AuthProvider] API falhou, aguardando login completo');
              }
            } catch (apiError) {
              // Não salvar dados se não conseguir obter o server ID
              console.log('[AuthProvider] Erro na API, aguardando login completo');
            }
          } else {
            console.log('[AuthProvider] Nenhuma sessão Supabase encontrada');
          }
        } catch (error) {
          console.error('[AuthProvider] Erro ao verificar sessão Supabase:', error);
        }
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