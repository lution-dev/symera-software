import React from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/forms/LoginForm";
import RegisterForm from "@/components/forms/RegisterForm";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";

const Auth: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = React.useState(true);
  
  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Left side with background image */}
      <div className="hidden sm:flex sm:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-purple-950 opacity-90"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1169&auto=format&fit=crop')", opacity: 0.3 }}></div>
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <Logo className="h-24 w-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text text-center">Symera</h1>
          <p className="text-center mb-6 max-w-md text-lg">
            Faz parte do seu dia-a-dia, faz parte do seu evento!
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-primary text-center text-xl mb-2">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 className="font-semibold text-center mb-1">Checklist Inteligente</h3>
              <p className="text-sm text-center opacity-80">Gerado por IA de acordo com suas necessidades</p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-primary text-center text-xl mb-2">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3 className="font-semibold text-center mb-1">Cronograma</h3>
              <p className="text-sm text-center opacity-80">Organização completa de suas tarefas</p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-primary text-center text-xl mb-2">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3 className="font-semibold text-center mb-1">Documentos</h3>
              <p className="text-sm text-center opacity-80">Contratos e arquivos organizados</p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-primary text-center text-xl mb-2">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="font-semibold text-center mb-1">Produtividade</h3>
              <p className="text-sm text-center opacity-80">Análises e métricas para seu evento</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default Auth;
