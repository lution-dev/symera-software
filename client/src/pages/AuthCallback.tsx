import { useEffect, useState, useRef } from "react";
import { getSupabase } from "../lib/supabase";
import { authManager } from "../lib/auth";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Iniciando...");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    
    const handleCallback = async () => {
      try {
        console.log("[AuthCallback] === INICIANDO CALLBACK ===");
        console.log("[AuthCallback] URL completa:", window.location.href);
        console.log("[AuthCallback] Search params:", window.location.search);
        console.log("[AuthCallback] Hash:", window.location.hash);
        
        setStatus("Conectando...");
        const supabase = await getSupabase();
        console.log("[AuthCallback] Supabase inicializado");
        
        // Verifica se há código na URL (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log("[AuthCallback] Código PKCE na URL:", code ? "SIM" : "NÃO");
        
        if (code) {
          console.log("[AuthCallback] Trocando código por sessão...");
          setStatus("Finalizando login...");
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("[AuthCallback] Erro ao trocar código:", exchangeError.message);
            setError(`Erro: ${exchangeError.message}`);
            setTimeout(() => window.location.href = "/auth", 3000);
            return;
          }
          
          if (data.session) {
            console.log("[AuthCallback] Sessão obtida com sucesso!");
            console.log("[AuthCallback] User ID:", data.session.user.id);
            console.log("[AuthCallback] Email:", data.session.user.email);
            
            setStatus("Salvando sessão...");
            authManager.saveAuthData(data.session);
            
            setStatus("Configurando conta...");
            const response = await fetch("/api/auth/user", {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            });

            console.log("[AuthCallback] Resposta /api/auth/user:", response.status);
            
            if (response.ok) {
              console.log("[AuthCallback] SUCESSO! Redirecionando para home...");
              setStatus("Login concluído!");
              
              // Limpa a URL e redireciona
              window.history.replaceState({}, '', '/');
              window.location.href = "/";
              return;
            } else {
              const errorText = await response.text();
              console.error("[AuthCallback] Erro ao criar usuário:", errorText);
              setError("Erro ao configurar conta.");
              setTimeout(() => window.location.href = "/auth", 3000);
              return;
            }
          }
        }
        
        // Tenta obter sessão existente
        console.log("[AuthCallback] Verificando sessão existente...");
        setStatus("Verificando sessão...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[AuthCallback] Sessão existente:", session ? "SIM" : "NÃO");
        
        if (sessionError) {
          console.error("[AuthCallback] Erro ao obter sessão:", sessionError);
          setError(`Erro: ${sessionError.message}`);
          setTimeout(() => window.location.href = "/auth", 3000);
          return;
        }

        if (session) {
          console.log("[AuthCallback] Usando sessão existente");
          authManager.saveAuthData(session);
          
          const response = await fetch("/api/auth/user", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            window.location.href = "/";
            return;
          }
        }
        
        console.log("[AuthCallback] Nenhuma sessão encontrada");
        setError("Login não completado. Tente novamente.");
        setTimeout(() => window.location.href = "/auth", 3000);
        
      } catch (err: any) {
        console.error("[AuthCallback] Erro inesperado:", err);
        setError(`Erro: ${err.message || "Erro inesperado"}`);
        setTimeout(() => window.location.href = "/auth", 3000);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
