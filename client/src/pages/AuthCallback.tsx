import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getSupabase } from "../lib/supabase";
import { authManager } from "../lib/auth";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Iniciando...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[AuthCallback] Iniciando processamento...");
        console.log("[AuthCallback] URL:", window.location.href);
        
        setStatus("Conectando ao serviço de autenticação...");
        const supabase = await getSupabase();
        
        // Aguarda um momento para o Supabase processar a URL automaticamente
        setStatus("Processando autenticação...");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Tenta obter a sessão (o Supabase com detectSessionInUrl deve processar automaticamente)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("[AuthCallback] Sessão:", session ? "encontrada" : "não encontrada");
        console.log("[AuthCallback] Erro:", sessionError);
        
        if (sessionError) {
          console.error("[AuthCallback] Erro ao obter sessão:", sessionError);
          setError(`Erro: ${sessionError.message}`);
          setTimeout(() => window.location.href = "/auth", 3000);
          return;
        }

        if (session) {
          console.log("[AuthCallback] Sessão válida encontrada!");
          setStatus("Salvando dados de autenticação...");
          authManager.saveAuthData(session);
          
          setStatus("Configurando sua conta...");
          const response = await fetch("/api/auth/user", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            console.log("[AuthCallback] Sucesso! Redirecionando para home...");
            setStatus("Login concluído! Redirecionando...");
            window.location.href = "/";
            return;
          } else {
            const errorText = await response.text();
            console.error("[AuthCallback] Erro ao criar usuário:", errorText);
            setError("Erro ao configurar conta. Tente novamente.");
            setTimeout(() => window.location.href = "/auth", 3000);
            return;
          }
        }
        
        // Se não tem sessão, pode ser que o código PKCE ainda não foi processado
        // Tenta forçar o processamento se houver código na URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log("[AuthCallback] Tentando trocar código PKCE manualmente...");
          setStatus("Finalizando autenticação...");
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("[AuthCallback] Erro ao trocar código:", exchangeError);
            setError(`Erro: ${exchangeError.message}`);
            setTimeout(() => window.location.href = "/auth", 3000);
            return;
          }
          
          if (data.session) {
            console.log("[AuthCallback] Sessão obtida via PKCE!");
            authManager.saveAuthData(data.session);
            
            const response = await fetch("/api/auth/user", {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            });

            if (response.ok) {
              console.log("[AuthCallback] Sucesso!");
              window.location.href = "/";
              return;
            }
          }
        }
        
        // Se chegou aqui, algo deu errado
        console.log("[AuthCallback] Nenhuma sessão encontrada");
        setError("Não foi possível completar o login. Tente novamente.");
        setTimeout(() => window.location.href = "/auth", 3000);
        
      } catch (err) {
        console.error("[AuthCallback] Erro inesperado:", err);
        setError("Erro inesperado. Tente novamente.");
        setTimeout(() => window.location.href = "/auth", 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
