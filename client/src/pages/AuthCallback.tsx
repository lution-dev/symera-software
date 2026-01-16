import { useEffect, useState, useRef } from "react";
import { getSupabase } from "../lib/supabase";
import { authManager } from "../lib/auth";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Entrando na sua conta...");
  const processedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    
    const handleCallback = async () => {
      console.log("[AuthCallback] === INICIANDO CALLBACK ===");
      console.log("[AuthCallback] URL:", window.location.href);
      
      try {
        const supabase = await getSupabase();
        
        timeoutRef.current = setTimeout(() => {
          console.log("[AuthCallback] Timeout - redirecionando para auth");
          setError("Tempo esgotado. Tente fazer login novamente.");
          setTimeout(() => window.location.href = "/auth", 2000);
        }, 15000);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("[AuthCallback] Auth event:", event, "Session:", !!session);
            
            if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              subscription.unsubscribe();
              
              console.log("[AuthCallback] Sessão válida detectada!");
              console.log("[AuthCallback] User:", session.user.email);
              
              await processSession(session);
            }
          }
        );
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        
        if (errorParam) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          const errorDesc = urlParams.get('error_description') || errorParam;
          console.error("[AuthCallback] Erro OAuth:", errorDesc);
          setError(`Erro: ${errorDesc}`);
          setTimeout(() => window.location.href = "/auth", 3000);
          return;
        }
        
        if (code) {
          console.log("[AuthCallback] Código encontrado, trocando por sessão...");
          setStatus("Processando autenticação...");
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.log("[AuthCallback] Erro ao trocar código:", exchangeError.message);
            
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              console.log("[AuthCallback] Sessão encontrada após erro de exchange");
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              await processSession(session);
              return;
            }
          } else if (data?.session) {
            console.log("[AuthCallback] Sessão obtida via exchange!");
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            await processSession(data.session);
            return;
          }
        }
        
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log("[AuthCallback] Token encontrado no hash");
          setStatus("Processando autenticação...");
          
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log("[AuthCallback] Sessão encontrada via hash");
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            await processSession(session);
            return;
          }
        }
        
        console.log("[AuthCallback] Verificando sessão existente...");
        setStatus("Verificando sessão...");
        
        await new Promise(r => setTimeout(r, 1000));
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("[AuthCallback] Sessão encontrada!");
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          await processSession(session);
        } else {
          console.log("[AuthCallback] Aguardando auth state change...");
        }
        
      } catch (err: any) {
        console.error("[AuthCallback] Erro:", err);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setError(`Erro: ${err.message}`);
        setTimeout(() => window.location.href = "/auth", 3000);
      }
    };
    
    const processSession = async (session: any) => {
      console.log("[AuthCallback] === PROCESSANDO SESSÃO ===");
      console.log("[AuthCallback] User ID:", session.user.id);
      console.log("[AuthCallback] Email:", session.user.email);
      
      setStatus("Configurando sua conta...");
      authManager.saveAuthData(session);
      
      try {
        const response = await fetch("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        console.log("[AuthCallback] API response:", response.status);
        
        if (response.ok) {
          console.log("[AuthCallback] Sucesso! Redirecionando...");
          setStatus("Pronto!");
          window.history.replaceState({}, '', '/');
          window.location.href = "/";
        } else {
          const text = await response.text();
          console.error("[AuthCallback] Erro API:", text);
          setError("Erro ao configurar conta.");
          setTimeout(() => window.location.href = "/auth", 3000);
        }
      } catch (err: any) {
        console.error("[AuthCallback] Erro ao chamar API:", err);
        setError(`Erro: ${err.message}`);
        setTimeout(() => window.location.href = "/auth", 3000);
      }
    };

    handleCallback();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
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
