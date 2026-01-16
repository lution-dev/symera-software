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
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        console.log("[AuthCallback] Código na URL:", code ? "SIM" : "NÃO");
        console.log("[AuthCallback] Erro na URL:", errorParam || "Nenhum");
        
        if (errorParam) {
          console.error("[AuthCallback] Erro do OAuth:", errorParam, errorDescription);
          setError(`Erro de autenticação: ${errorDescription || errorParam}`);
          setTimeout(() => window.location.href = "/auth", 3000);
          return;
        }
        
        if (code) {
          console.log("[AuthCallback] Processando código de autorização...");
          setStatus("Finalizando login...");
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("[AuthCallback] Erro ao trocar código:", exchangeError.message);
            
            if (exchangeError.message.includes('code verifier')) {
              console.log("[AuthCallback] Código já foi usado ou expirou, verificando sessão existente...");
            } else {
              setError(`Erro ao processar login: ${exchangeError.message}`);
              setTimeout(() => window.location.href = "/auth", 3000);
              return;
            }
          }
          
          if (data?.session) {
            console.log("[AuthCallback] Sessão obtida via code exchange!");
            await processSession(data.session);
            return;
          }
        }
        
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log("[AuthCallback] Access token no hash:", accessToken ? "SIM" : "NÃO");
        
        if (accessToken) {
          console.log("[AuthCallback] Tokens encontrados no hash, configurando sessão...");
          setStatus("Processando autenticação...");
          
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (setSessionError) {
            console.error("[AuthCallback] Erro ao definir sessão:", setSessionError.message);
          } else if (data.session) {
            console.log("[AuthCallback] Sessão obtida via hash tokens!");
            await processSession(data.session);
            return;
          }
        }
        
        console.log("[AuthCallback] Verificando sessão existente no Supabase...");
        setStatus("Verificando sessão...");
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[AuthCallback] Sessão existente:", session ? "SIM" : "NÃO");
        
        if (sessionError) {
          console.error("[AuthCallback] Erro ao obter sessão:", sessionError.message);
        }

        if (session) {
          console.log("[AuthCallback] Usando sessão existente do Supabase");
          await processSession(session);
          return;
        }
        
        console.log("[AuthCallback] Nenhuma sessão encontrada após todas as tentativas");
        setError("Login não completado. Tente novamente.");
        setTimeout(() => window.location.href = "/auth", 3000);
        
      } catch (err: any) {
        console.error("[AuthCallback] Erro inesperado:", err);
        setError(`Erro: ${err.message || "Erro inesperado"}`);
        setTimeout(() => window.location.href = "/auth", 3000);
      }
    };
    
    const processSession = async (session: any) => {
      try {
        console.log("[AuthCallback] === PROCESSANDO SESSÃO ===");
        console.log("[AuthCallback] User ID:", session.user.id);
        console.log("[AuthCallback] Email:", session.user.email);
        
        setStatus("Salvando sessão...");
        authManager.saveAuthData(session);
        
        setStatus("Configurando conta...");
        const response = await fetch("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        console.log("[AuthCallback] Resposta /api/auth/user:", response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log("[AuthCallback] Usuário configurado:", userData.id, userData.email);
          console.log("[AuthCallback] SUCESSO! Redirecionando para home...");
          setStatus("Login concluído!");
          
          window.history.replaceState({}, '', '/');
          window.location.href = "/";
        } else {
          const errorText = await response.text();
          console.error("[AuthCallback] Erro ao criar usuário:", response.status, errorText);
          
          if (response.status === 401) {
            setError("Sessão inválida. Tente fazer login novamente.");
          } else {
            setError("Erro ao configurar conta. Tente novamente.");
          }
          setTimeout(() => window.location.href = "/auth", 3000);
        }
      } catch (err: any) {
        console.error("[AuthCallback] Erro ao processar sessão:", err);
        setError(`Erro: ${err.message}`);
        setTimeout(() => window.location.href = "/auth", 3000);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
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
