import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import Event from "@/pages/Event";
import CreateEvent from "@/pages/CreateEvent";
import Checklist from "@/pages/Checklist";
import Schedule from "@/pages/Schedule";
import Team from "@/pages/Team";
import Vendors from "@/pages/Vendors";
import Budget from "@/pages/Budget";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import LoginPage from "@/pages/LoginPage";
import DevLogin from "@/pages/DevLogin";
import SimpleLogin from "@/pages/SimpleLogin";
import DemoProfile from "@/pages/DemoProfile";
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
      <Route path="/auth" component={Auth} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/events" component={() => <ProtectedRoute component={Events} />} />
      <Route path="/events/new" component={() => <ProtectedRoute component={CreateEvent} />} />
      <Route path="/events/:id" component={(params: any) => <ProtectedRoute component={Event} id={params.id} />} />
      <Route path="/events/:id/checklist" component={(params: any) => <ProtectedRoute component={Checklist} id={params.id} />} />
      <Route path="/schedule" component={() => <ProtectedRoute component={Schedule} />} />
      <Route path="/team" component={() => <ProtectedRoute component={Team} />} />
      <Route path="/vendors" component={() => <ProtectedRoute component={Vendors} />} />
      <Route path="/budget" component={() => <ProtectedRoute component={Budget} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
