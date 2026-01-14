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
        const supabase = await getSupabase();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro no callback:", error);
          setError("Erro ao processar login. Tente novamente.");
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }

        if (session) {
          authManager.saveAuthData(session);
          
          const response = await fetch("/api/auth/user", {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            navigate("/");
          } else {
            console.error("Erro ao criar usuário no backend");
            setError("Erro ao criar conta. Tente novamente.");
            setTimeout(() => navigate("/auth"), 3000);
          }
        } else {
          navigate("/auth");
        }
      } catch (err) {
        console.error("Erro no callback:", err);
        setError("Erro inesperado. Tente novamente.");
        setTimeout(() => navigate("/auth"), 3000);
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processando login...</p>
      </div>
    </div>
  );
}
