import { useEffect, useState, useRef } from "react";
import { getSupabase } from "../lib/supabase";
import { authManager } from "../lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Autenticando...");
  const [, navigate] = useLocation();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    let mounted = true;

    const processAuth = async () => {
      try {
        console.log("[AuthCallback] URL:", window.location.href);

        // Inicializar Supabase (com detectSessionInUrl: true, ele auto-processa tokens do hash)
        const supabase = await getSupabase();
        console.log("[AuthCallback] Supabase inicializado");

        if (mounted) setStatus("Verificando sessão...");

        // Usar onAuthStateChange para detectar quando o Supabase processar os tokens
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("[AuthCallback] Auth event:", event, "Session:", !!session);

            if (event === "SIGNED_IN" && session) {
              console.log("[AuthCallback] SIGNED_IN detectado!");
              subscription.unsubscribe();
              await handleSuccess(session);
            }
          }
        );

        // Também verificar se já existe uma sessão (caso o evento já tenha disparado)
        // Pequeno delay para dar tempo ao Supabase de processar o hash
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: { session } } = await supabase.auth.getSession();
        console.log("[AuthCallback] getSession:", !!session);

        if (session) {
          console.log("[AuthCallback] Sessão encontrada via getSession");
          subscription.unsubscribe();
          await handleSuccess(session);
          return;
        }

        // Verificar se tem erro na URL
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get("error");
        if (errorParam) {
          const errorDesc = urlParams.get("error_description") || errorParam;
          subscription.unsubscribe();
          if (mounted) setError(errorDesc);
          return;
        }

        // Verificar se tem código PKCE (caso mude para PKCE no futuro)
        const code = urlParams.get("code");
        if (code) {
          console.log("[AuthCallback] Trocando código PKCE...");
          if (mounted) setStatus("Processando código...");

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("[AuthCallback] Erro PKCE:", exchangeError);
            throw exchangeError;
          }
          if (data.session) {
            subscription.unsubscribe();
            await handleSuccess(data.session);
            return;
          }
        }

        // Se chegou aqui, aguardar o evento SIGNED_IN por até 10 segundos
        console.log("[AuthCallback] Aguardando evento SIGNED_IN...");
        if (mounted) setStatus("Aguardando autenticação...");

        setTimeout(() => {
          if (mounted && !error) {
            subscription.unsubscribe();
            setError("Tempo limite excedido. O login pode não ter sido completado.");
          }
        }, 10000);

      } catch (err: any) {
        console.error("[AuthCallback] Erro:", err);
        if (mounted) {
          setError(err.message || "Erro inesperado durante o login.");
        }
      }
    };

    const handleSuccess = async (session: any) => {
      if (!mounted) return;

      try {
        console.log("[AuthCallback] handleSuccess - User:", session.user?.email);
        setStatus("Configurando conta...");

        // Buscar dados do usuário no servidor
        const userResponse = await fetch("/api/auth/user", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        console.log("[AuthCallback] /api/auth/user status:", userResponse.status);

        if (!userResponse.ok) {
          console.warn("[AuthCallback] Falha no /api/auth/user, usando dados da sessão");
          authManager.saveAuthData(session);
        } else {
          const serverUser = await userResponse.json();
          console.log("[AuthCallback] Server user ID:", serverUser.id);
          authManager.saveAuthDataWithServerId(session, serverUser.id);
        }

        // Verificar se os dados foram salvos
        const savedData = authManager.getAuthData();
        console.log("[AuthCallback] Dados salvos:", !!savedData, savedData?.userId);

        setStatus("Redirecionando para o dashboard...");

        // Usar window.location.href para garantir um reload completo
        // Isso garante que AuthProvider e useAuth reinicializem com os novos dados
        window.location.href = "/";

      } catch (err: any) {
        console.error("[AuthCallback] Erro no pós-processamento:", err);
        // Salvar o que tiver e redirecionar
        authManager.saveAuthData(session);
        window.location.href = "/";
      }
    };

    processAuth();

    return () => {
      mounted = false;
    };
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
