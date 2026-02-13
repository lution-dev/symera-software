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
    let timeoutId: ReturnType<typeof setTimeout>;

    const processAuth = async () => {
      try {
        console.log("[AuthCallback] URL:", window.location.href);
        console.log("[AuthCallback] Hash presente:", !!window.location.hash);

        // Inicializar Supabase - com detectSessionInUrl: true, ele auto-processa tokens do hash
        const supabase = await getSupabase();
        console.log("[AuthCallback] Supabase inicializado");

        if (mounted) setStatus("Verificando sessão...");

        // Estratégia: usar onAuthStateChange para pegar o momento exato
        // em que o Supabase processa os tokens do hash (fluxo implícito)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("[AuthCallback] Auth event:", event);

            if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") && session) {
              console.log("[AuthCallback] Sessão detectada via evento:", event);
              subscription.unsubscribe();
              clearTimeout(timeoutId);
              await handleSuccess(session);
            }
          }
        );

        // Verificar se tem erro na URL
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get("error");
        if (errorParam) {
          const errorDesc = urlParams.get("error_description") || errorParam;
          subscription.unsubscribe();
          if (mounted) setError(errorDesc);
          return;
        }

        // Verificar se tem código PKCE
        const code = urlParams.get("code");
        if (code) {
          console.log("[AuthCallback] Trocando código PKCE...");
          if (mounted) setStatus("Processando código...");

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("[AuthCallback] Erro PKCE:", exchangeError.message);
            // Não falhar - pode ser que o onAuthStateChange já processou
          } else if (data.session) {
            subscription.unsubscribe();
            clearTimeout(timeoutId);
            await handleSuccess(data.session);
            return;
          }
        }

        // Aguardar um pouco para o Supabase processar o hash (fluxo implícito)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Checar sessão após o delay
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[AuthCallback] getSession após delay:", !!session);

        if (session) {
          subscription.unsubscribe();
          clearTimeout(timeoutId);
          await handleSuccess(session);
          return;
        }

        // Se ainda não tem sessão, dar mais tempo (até 10s total)
        console.log("[AuthCallback] Aguardando evento de autenticação...");
        if (mounted) setStatus("Aguardando resposta do Google...");

        timeoutId = setTimeout(() => {
          if (mounted) {
            subscription.unsubscribe();
            setError("Tempo limite excedido. Tente fazer login novamente.");
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

        // Salvar dados de auth IMEDIATAMENTE (antes de fetch ao servidor)
        // Isso garante que mesmo que o fetch falhe, temos dados locais
        authManager.saveAuthData(session);
        console.log("[AuthCallback] Auth data salvo no localStorage");

        // Tentar buscar dados do servidor (sem bloquear o fluxo)
        try {
          const userResponse = await fetch("/api/auth/user", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          console.log("[AuthCallback] /api/auth/user status:", userResponse.status);

          if (userResponse.ok) {
            const serverUser = await userResponse.json();
            console.log("[AuthCallback] Server user ID:", serverUser.id);
            // Atualizar com o ID do servidor (sobrescreve os dados salvos acima)
            authManager.saveAuthDataWithServerId(session, serverUser.id);
          }
        } catch (fetchErr) {
          console.warn("[AuthCallback] Erro ao buscar /api/auth/user (não crítico):", fetchErr);
          // Não bloquear - já temos os dados salvos acima
        }

        // Verificar se os dados foram salvos
        const savedData = authManager.getAuthData();
        console.log("[AuthCallback] Dados salvos confirmados:", !!savedData);

        setStatus("Redirecionando para o dashboard...");

        // Usar window.location.href para reload completo
        // Garantir que AuthProvider reinicialize com os novos dados
        window.location.href = "/";

      } catch (err: any) {
        console.error("[AuthCallback] Erro no handleSuccess:", err);
        // Dados já salvos via saveAuthData acima, apenas redirecionar
        window.location.href = "/";
      }
    };

    processAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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
