import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getSupabase } from "../lib/supabase";
import { authManager } from "../lib/auth";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[AuthCallback] Iniciando processamento...");
        console.log("[AuthCallback] URL atual:", window.location.href);
        
        const supabase = await getSupabase();
        
        // Primeiro, tenta extrair sessão do hash (OAuth redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log("[AuthCallback] Token encontrado no hash");
        }
        
        // O Supabase automaticamente processa o hash, então basta pegar a sessão
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("[AuthCallback] Sessão:", session ? "encontrada" : "não encontrada");
        
        if (error) {
          console.error("[AuthCallback] Erro:", error);
          setError("Erro ao processar login. Tente novamente.");
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }

        if (session) {
          console.log("[AuthCallback] Salvando dados de autenticação...");
          authManager.saveAuthData(session);
          
          console.log("[AuthCallback] Provisionando usuário no backend...");
          const response = await fetch("/api/auth/user", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            console.log("[AuthCallback] Sucesso! Redirecionando...");
            window.location.href = "/";
          } else {
            console.error("[AuthCallback] Erro ao criar usuário:", await response.text());
            setError("Erro ao criar conta. Tente novamente.");
            setTimeout(() => navigate("/auth"), 3000);
          }
        } else {
          console.log("[AuthCallback] Sem sessão, redirecionando para login");
          navigate("/auth");
        }
      } catch (err) {
        console.error("[AuthCallback] Erro inesperado:", err);
        setError("Erro inesperado. Tente novamente.");
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    // Pequeno delay para garantir que o Supabase processe o hash
    setTimeout(handleCallback, 100);
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processando login...</p>
      </div>
    </div>
  );
}
