import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabase";
import { authManager } from "../lib/auth";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Entrando na sua conta...");

  useEffect(() => {
    let mounted = true;
    
    const processAuth = async () => {
      try {
        const supabase = await getSupabase();
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        
        if (errorParam) {
          const errorDesc = urlParams.get('error_description') || errorParam;
          if (mounted) {
            setError(errorDesc);
            setTimeout(() => window.location.href = "/auth", 3000);
          }
          return;
        }
        
        let session = null;
        
        if (code) {
          if (mounted) setStatus("Processando autenticação...");
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            session = existingSession;
          } else {
            session = data?.session;
          }
        } else {
          const { data: { session: existingSession } } = await supabase.auth.getSession();
          session = existingSession;
        }
        
        if (!session) {
          if (mounted) {
            setError("Login não completado. Tente novamente.");
            setTimeout(() => window.location.href = "/auth", 3000);
          }
          return;
        }
        
        if (mounted) setStatus("Configurando conta...");
        authManager.saveAuthData(session);
        
        await fetch("/api/auth/user", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        window.history.replaceState({}, '', '/');
        window.location.href = "/";
        
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Erro inesperado");
          setTimeout(() => window.location.href = "/auth", 3000);
        }
      }
    };

    processAuth();
    
    return () => { mounted = false; };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{status}</h3>
        <p className="text-sm text-muted-foreground">Aguarde um momento...</p>
      </div>
    </div>
  );
}
