import { useEffect, useState, useRef } from "react";
import { getSupabase } from "../lib/supabase";
import { authManager } from "../lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Iniciando autenticação...");
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [, navigate] = useLocation();
  const processedRef = useRef(false);

  const addLog = (msg: string) => {
    console.log("[AuthCallback]", msg);
    setDebugLog(prev => [...prev, `${new Date().toISOString().substring(11, 19)} ${msg}`]);
  };

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    let mounted = true;

    const processAuth = async () => {
      try {
        // Log all URL info
        addLog(`URL: ${window.location.href}`);
        addLog(`Search: ${window.location.search}`);
        addLog(`Hash: ${window.location.hash ? window.location.hash.substring(0, 50) + '...' : '(vazio)'}`);

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const errorParam = urlParams.get("error");

        // Also check hash for implicit flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessTokenFromHash = hashParams.get("access_token");

        addLog(`Code: ${code ? code.substring(0, 10) + '...' : 'NULL'}`);
        addLog(`Error param: ${errorParam || 'NULL'}`);
        addLog(`Access token in hash: ${accessTokenFromHash ? 'SIM' : 'NAO'}`);

        if (errorParam) {
          const errorDesc = urlParams.get("error_description") || errorParam;
          addLog(`ERRO da URL: ${errorDesc}`);
          if (mounted) setError(errorDesc);
          return;
        }

        addLog("Inicializando Supabase...");
        const supabase = await getSupabase();
        addLog("Supabase inicializado OK");

        // If we have an access token in the hash (implicit flow), try to set session
        if (accessTokenFromHash) {
          addLog("Fluxo implícito detectado - token no hash");
          const refreshToken = hashParams.get("refresh_token");
          if (refreshToken) {
            addLog("Definindo sessão com tokens do hash...");
            const { data, error: setError } = await supabase.auth.setSession({
              access_token: accessTokenFromHash,
              refresh_token: refreshToken,
            });
            if (setError) {
              addLog(`ERRO ao definir sessão: ${setError.message}`);
              throw setError;
            }
            if (data.session) {
              addLog("Sessão criada via tokens do hash!");
              await handleSuccess(data.session);
              return;
            }
          }
        }

        if (code) {
          addLog("Fluxo PKCE detectado - trocando código...");
          if (mounted) setStatus("Trocando código de autorização...");

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            addLog(`ERRO ao trocar código: ${exchangeError.message}`);

            // Try to get existing session
            addLog("Tentando recuperar sessão existente...");
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            if (existingSession) {
              addLog("Sessão existente encontrada após erro!");
              await handleSuccess(existingSession);
              return;
            }
            addLog("Nenhuma sessão existente encontrada");
            throw exchangeError;
          }

          if (!data.session) {
            addLog("ERRO: exchangeCodeForSession retornou sem sessão");
            throw new Error("Sessão não criada após troca de código.");
          }

          addLog("Código trocado com sucesso! Sessão criada.");
          await handleSuccess(data.session);
          return;
        }

        // No code, no hash token - check for existing session
        addLog("Sem código nem token. Verificando sessão existente...");
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          addLog("Sessão existente encontrada!");
          await handleSuccess(existingSession);
          return;
        }

        addLog("NENHUMA sessão encontrada. Login falhou.");
        if (mounted) setError("Código de autenticação não encontrado na URL.");
      } catch (err: any) {
        addLog(`ERRO FATAL: ${err.message || String(err)}`);
        if (mounted) {
          setError(err.message || "Erro inesperado durante o login.");
        }
      }
    };

    const handleSuccess = async (session: any) => {
      if (!mounted) return;

      try {
        addLog(`Sessão obtida! User: ${session.user?.email || 'unknown'}`);
        addLog("Buscando dados do usuário no servidor...");
        setStatus("Buscando dados do usuário...");

        const userResponse = await fetch("/api/auth/user", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        addLog(`Resposta /api/auth/user: ${userResponse.status}`);

        if (!userResponse.ok) {
          addLog(`Falha ao buscar usuário (${userResponse.status}). Salvando com dados da sessão.`);
          authManager.saveAuthData(session);
        } else {
          const serverUser = await userResponse.json();
          addLog(`Usuário do servidor: ${serverUser.id} (${serverUser.email || 'no email'})`);
          authManager.saveAuthDataWithServerId(session, serverUser.id);
        }

        addLog("Dados salvos no localStorage. Redirecionando para /...");
        setStatus("Redirecionando...");
        setTimeout(() => {
          addLog("Navegando para /");
          navigate("/");
        }, 200);
      } catch (err: any) {
        addLog(`ERRO no pós-processamento: ${err.message}`);
        authManager.saveAuthData(session);
        navigate("/");
      }
    };

    processAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Always show debug log
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className={error ? "text-red-600" : "text-primary"}>
            {error ? "❌ Falha no Login" : "🔄 " + status}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100">
              {error}
            </div>
          )}

          {!error && (
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              </div>
              <p className="text-sm text-muted-foreground">Processando...</p>
            </div>
          )}

          {/* Debug log - TEMPORÁRIO */}
          <div className="mt-4 p-3 bg-gray-900 text-green-400 rounded-md text-xs font-mono max-h-64 overflow-y-auto">
            <p className="text-gray-500 mb-2">--- Debug Log (temporário) ---</p>
            {debugLog.map((log, i) => (
              <p key={i} className="whitespace-pre-wrap">{log}</p>
            ))}
            {debugLog.length === 0 && <p className="text-gray-600">Aguardando...</p>}
          </div>

          {error && (
            <Button
              className="w-full"
              onClick={() => navigate("/auth")}
              variant="default"
            >
              Voltar para Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
