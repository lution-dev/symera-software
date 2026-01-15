import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import Event from "@/pages/EventDetailRefactored";
import CreateEvent from "@/pages/CreateEvent";
import EditEvent from "@/pages/EditEvent";
import EventTeam from "@/pages/EventTeam";
import Checklist from "@/pages/Checklist";
import TaskNew from "@/pages/TaskNew";
import TaskEdit from "@/pages/TaskEdit";
import Schedule from "@/pages/Schedule";
import Team from "@/pages/Team";
import Vendors from "@/pages/Vendors";
import Budget from "@/pages/Budget";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import ProfileEventos from "@/pages/ProfileEventos";
import ProfileEquipe from "@/pages/ProfileEquipe";
import ProfileLembretes from "@/pages/ProfileLembretes";
import ProfileConfiguracoes from "@/pages/ProfileConfiguracoes";
import ProfileConfigPerfil from "@/pages/ProfileConfigPerfil";
import ProfileConfigNotificacoes from "@/pages/ProfileConfigNotificacoes";
import ProfileConfigAparencia from "@/pages/ProfileConfigAparencia";
import ProfileConfigSeguranca from "@/pages/ProfileConfigSeguranca";
import Auth from "@/pages/Auth";

import PublicFeedback from "@/pages/PublicFeedback";
import AuthCallback from "@/pages/AuthCallback";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { authManager } from "@/lib/auth";

function OAuthCodeHandler({ children }: { children: React.ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [status, setStatus] = useState("Finalizando login...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    // Fluxo implícito: token vem no hash (#access_token=xxx)
    const hash = window.location.hash;
    const hasAuthToken = hash.includes('access_token=');
    
    if (hasAuthToken && !processed) {
      console.log('[OAuthHandler] Token OAuth detectado no hash');
      setIsProcessing(true);
      setProcessed(true);
      
      (async () => {
        try {
          setStatus("Conectando...");
          const supabase = await getSupabase();
          console.log('[OAuthHandler] Supabase inicializado');
          
          setStatus("Validando autenticação...");
          
          // O Supabase com detectSessionInUrl processa automaticamente o hash
          // Aguardar um momento para o processamento
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          console.log('[OAuthHandler] Resultado:', { hasSession: !!session, error: error?.message });
          
          if (error) {
            console.error('[OAuthHandler] Erro:', error.message);
            setErrorMsg(`Erro: ${error.message}`);
            setTimeout(() => window.location.href = '/auth', 3000);
            return;
          }
          
          if (session) {
            console.log('[OAuthHandler] Sessão obtida com sucesso!');
            console.log('[OAuthHandler] User:', session.user.email);
            
            setStatus("Salvando sessão...");
            authManager.saveAuthData(session);
            
            setStatus("Configurando conta...");
            const response = await fetch('/api/auth/user', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            
            console.log('[OAuthHandler] Resposta API:', response.status);
            
            if (response.ok) {
              const userData = await response.json();
              console.log('[OAuthHandler] Usuário configurado:', userData.email);
              setStatus("Login completo! Redirecionando...");
              
              // Limpar URL e redirecionar
              window.history.replaceState({}, '', '/');
              setTimeout(() => {
                window.location.reload();
              }, 500);
              return;
            } else {
              const errorText = await response.text();
              console.error('[OAuthHandler] Erro na API:', errorText);
              setErrorMsg(`Erro ao configurar conta: ${response.status}`);
              setTimeout(() => window.location.href = '/auth', 3000);
              return;
            }
          } else {
            console.error('[OAuthHandler] Nenhuma sessão encontrada após processamento');
            setErrorMsg("Erro ao processar autenticação");
            setTimeout(() => window.location.href = '/auth', 3000);
          }
        } catch (err: any) {
          console.error('[OAuthHandler] Erro inesperado:', err);
          setErrorMsg(`Erro: ${err.message || 'Erro inesperado'}`);
          setTimeout(() => window.location.href = '/auth', 3000);
        }
      })();
    }
  }, [processed]);
  
  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-2">{errorMsg}</p>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }
  
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{status}</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading, error } = useAuth();
  const [, navigate] = useLocation();

  // Force redirect on authentication error
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || error)) {
      window.location.href = "/auth";
    }
  }, [isAuthenticated, isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || error) {
    // Force immediate redirect
    window.location.href = "/auth";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  const [, setLocation] = useLocation();
  const isFeedbackRoute = window.location.pathname.startsWith('/feedback/');
  
  const { isAuthenticated, isLoading } = useAuth();

  // Force redirect for unauthenticated users (except feedback routes and auth routes)
  const isAuthRoute = window.location.pathname === '/auth' || 
                      window.location.pathname === '/auth/callback' || 
                      window.location.pathname === '/login';
  
  React.useEffect(() => {
    if (!isFeedbackRoute && !isLoading && !isAuthenticated && !isAuthRoute) {
      window.location.href = '/auth';
    }
  }, [isAuthenticated, isLoading, isFeedbackRoute, isAuthRoute]);

  // Show loading only for protected routes (not feedback or auth routes)
  if (!isFeedbackRoute && !isAuthRoute && isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/feedback/:feedbackId" component={PublicFeedback} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/auth" component={Auth} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/events" component={() => <ProtectedRoute component={Events} />} />
      <Route path="/events/new" component={() => <ProtectedRoute component={CreateEvent} />} />
      <Route path="/events/:id" component={(params: any) => <ProtectedRoute component={Event} id={params.id} />} />
      <Route path="/events/:id/edit" component={(params: any) => <ProtectedRoute component={EditEvent} id={params.id} />} />
      <Route path="/events/:id/checklist" component={(params: any) => <ProtectedRoute component={Checklist} id={params.id} />} />
      <Route path="/events/:id/team" component={(params: any) => <ProtectedRoute component={EventTeam} />} />
      <Route path="/events/:id/team/add" component={(params: any) => <ProtectedRoute component={EventTeam} />} />
      <Route path="/events/:id/tasks/new" component={(params: any) => <ProtectedRoute component={TaskNew} />} />
      <Route path="/events/:id/tasks/:taskId/edit" component={(params: any) => <ProtectedRoute component={TaskEdit} eventId={params.id} taskId={params.taskId} />} />
      <Route path="/schedule" component={() => <ProtectedRoute component={Schedule} />} />
      <Route path="/team" component={() => <ProtectedRoute component={Team} />} />
      <Route path="/vendors" component={() => <ProtectedRoute component={Vendors} />} />
      <Route path="/budget" component={() => <ProtectedRoute component={Budget} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/profile/eventos" component={() => <ProtectedRoute component={ProfileEventos} />} />
      <Route path="/profile/equipe" component={() => <ProtectedRoute component={ProfileEquipe} />} />
      <Route path="/profile/lembretes" component={() => <ProtectedRoute component={ProfileLembretes} />} />
      <Route path="/profile/configuracoes" component={() => <ProtectedRoute component={ProfileConfiguracoes} />} />
      <Route path="/profile/configuracoes/perfil" component={() => <ProtectedRoute component={ProfileConfigPerfil} />} />
      <Route path="/profile/configuracoes/notificacoes" component={() => <ProtectedRoute component={ProfileConfigNotificacoes} />} />
      <Route path="/profile/configuracoes/aparencia" component={() => <ProtectedRoute component={ProfileConfigAparencia} />} />
      <Route path="/profile/configuracoes/seguranca" component={() => <ProtectedRoute component={ProfileConfigSeguranca} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Verificar se é uma rota de feedback (completamente pública)
  const isFeedbackRoute = window.location.pathname.startsWith('/feedback/');
  
  // Verificar se a URL contém o parâmetro visitante
  const isVisitor = window.location.search.includes('visitante=true') || 
                    window.location.search.includes('visitor=true');
                    
  // Se for visitante, redirecionar para a página de login
  if (isVisitor) {
    window.location.href = '/login';
    return null;
  }
  
  // Se for rota de feedback, renderizar sem Layout nem autenticação
  if (isFeedbackRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Switch>
            <Route path="/feedback/:feedbackId" component={PublicFeedback} />
          </Switch>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OAuthCodeHandler>
          <AuthProvider>
            <Toaster />
            <Layout>
              <Router />
            </Layout>
          </AuthProvider>
        </OAuthCodeHandler>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
