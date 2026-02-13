import { useEffect, useState, useRef } from "react";
import { getSupabase } from "../lib/supabase";
import { authManager } from "../lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Iniciando autenticação...");
  const [, navigate] = useLocation();
  const processedRef = useRef(false);

  useEffect(() => {
    // Evitar dupla execução em React Strict Mode
    if (processedRef.current) return;
    processedRef.current = true;

    let mounted = true;

    const processAuth = async () => {
      try {
        const supabase = await getSupabase();
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');

        console.log("[AuthCallback] Iniciando processamento. Code presente?", !!code);

        if (errorParam) {
          const errorDesc = urlParams.get('error_description') || errorParam;
          console.error("[AuthCallback] Erro n URL:", errorDesc);
          if (mounted) setError(errorDesc);
          return;
        }

        if (!code) {
          console.log("[AuthCallback] Sem código, verificando sessão existente...");
          const { data: { session: existingSession } } = await supabase.auth.getSession();
          if (existingSession) {
            console.log("[AuthCallback] Sessão existente encontrada.");
            handleSuccess(existingSession);
            return;
          }
          if (mounted) setError("Código de autenticação não encontrado.");
          return;
        }

        if (mounted) setStatus("Trocando código de autorização...");

        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("[AuthCallback] Erro ao trocar código:", exchangeError);

          // Tentar recuperar sessão mesmo com erro (as vezes o código já foi usado mas a sessão tá lá)
          const { data: { session: existingSession } } = await supabase.auth.getSession();
          if (existingSession) {
            console.log("[AuthCallback] Recuperada sessão existente após erro de troca.");
            handleSuccess(existingSession);
            return;
          }

          throw exchangeError;
        }

        if (!data.session) {
          throw new Error("Sessão não criada após troca de código.");
        }

        handleSuccess(data.session);

      } catch (err: any) {
        console.error("[AuthCallback] Erro fatal:", err);
        if (mounted) {
          setError(err.message || "Erro inesperado durante o login.");
        }
      }
    };

    const handleSuccess = async (session: any) => {
      if (!mounted) return;

      try {
        setStatus("Buscando dados do usuário...");

        // Buscar dados do usuário do servidor
        const userResponse = await fetch("/api/auth/user", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (!userResponse.ok) {
          console.warn("[AuthCallback] Falha ao buscar dados do usuário:", userResponse.status);
          // Não bloquear o login se falhar o fetch do usuário, usar dados da sessão
          authManager.saveAuthData(session);
        } else {
          const serverUser = await userResponse.json();
          console.log("[AuthCallback] Dados do usuário recebidos:", serverUser.id);
          authManager.saveAuthDataWithServerId(session, serverUser.id);
        }

        setStatus("Redirecionando...");
        // Pequeno delay para garantir que o storage foi atualizado
        setTimeout(() => navigate("/"), 100);

      } catch (err) {
        console.error("[AuthCallback] Erro no pós-processamento:", err);
        // Tentar seguir mesmo com erro
        authManager.saveAuthData(session);
        navigate("/");
      }
    };

    processAuth();

    return () => { mounted = false; };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Falha no Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100">
              {error}
            </div>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro ao tentar conectar com o Google. Isso pode acontecer devido a configurações de segurança ou falhas de conexão.
            </p>
            <Button
              className="w-full"
              onClick={() => navigate("/auth")}
              variant="default"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
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
        <p className="text-sm text-muted-foreground">Estamos configurando seu acesso...</p>
      </div>
    </div>
  );
}

