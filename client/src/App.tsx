import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import Event from "@/pages/EventDetailNew";
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
import LoginPage from "@/pages/LoginPage";
import DevLogin from "@/pages/DevLogin";
import SimpleLogin from "@/pages/SimpleLogin";
import DemoProfile from "@/pages/DemoProfile";
import DemoApp from "@/pages/DemoApp";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Usar navigate em vez de window.location para manter a SPA
    navigate("/login");
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/dev-login" component={DevLogin} />
      <Route path="/simple-login" component={SimpleLogin} />
      <Route path="/demo-profile" component={DemoProfile} />
      <Route path="/demo" component={DemoApp} />
      <Route path="/auth" component={Auth} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/events" component={() => <ProtectedRoute component={Events} />} />
      <Route path="/events/new" component={() => <ProtectedRoute component={CreateEvent} />} />
      <Route path="/events/:id" component={(params: any) => <ProtectedRoute component={Event} id={params.id} />} />
      <Route path="/events/:id/edit" component={(params: any) => <ProtectedRoute component={EditEvent} id={params.id} />} />
      <Route path="/events/:id/checklist" component={(params: any) => <ProtectedRoute component={Checklist} id={params.id} />} />
      <Route path="/events/:id/team" component={(params: any) => <ProtectedRoute component={EventTeam} />} />
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
  // Verificar se a URL contém o parâmetro visitante
  const isVisitor = window.location.search.includes('visitante=true') || 
                    window.location.search.includes('visitor=true');
                    
  // Se for visitante, redirecionar para a página de login
  if (isVisitor) {
    window.location.href = '/login';
    return null;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Layout>
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
