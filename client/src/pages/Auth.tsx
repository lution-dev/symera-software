import React from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/forms/LoginForm";
import RegisterForm from "@/components/forms/RegisterForm";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Calendar, FileText, BarChart3, Sparkles } from "lucide-react";

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
      {/* Left side with background image and overlay */}
      <div className="hidden sm:flex sm:w-1/2 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 opacity-95"></div>
        
        {/* Background with parallax effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center transform transition-transform duration-5000 hover:scale-110" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1169&auto=format&fit=crop')", 
            opacity: 0.2
          }}
        ></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-20 h-20 rounded-full bg-orange-500 blur-3xl opacity-10 -top-10 left-20 animate-pulse"></div>
          <div className="absolute w-32 h-32 rounded-full bg-red-500 blur-3xl opacity-10 bottom-20 right-10 animate-pulse" style={{animationDelay: "1s"}}></div>
          <div className="absolute w-24 h-24 rounded-full bg-orange-500 blur-3xl opacity-10 top-1/2 left-1/4 animate-pulse" style={{animationDelay: "2s"}}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white animate-fadeIn">
          <div className="mb-8 relative">
            <Logo className="h-28 w-auto" />
            <div className="absolute -top-4 -right-4 text-orange-500">
              <Sparkles className="h-6 w-6 animate-pulse-border" />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 gradient-text text-center">Symera</h1>
          <p className="text-center mb-10 max-w-md text-xl">
            Faz parte do seu dia-a-dia, faz parte do seu evento!
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-4 w-full max-w-md">
            <div className="bg-black/20 backdrop-blur-md p-5 rounded-xl card-hover border border-white/5">
              <div className="text-primary text-center mb-3 flex justify-center">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-center mb-2">Checklist Inteligente</h3>
              <p className="text-sm text-center opacity-90">Gerado por IA de acordo com suas necessidades</p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md p-5 rounded-xl card-hover border border-white/5">
              <div className="text-primary text-center mb-3 flex justify-center">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-center mb-2">Cronograma</h3>
              <p className="text-sm text-center opacity-90">Organização completa de suas tarefas</p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md p-5 rounded-xl card-hover border border-white/5">
              <div className="text-primary text-center mb-3 flex justify-center">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-center mb-2">Documentos</h3>
              <p className="text-sm text-center opacity-90">Contratos e arquivos organizados</p>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md p-5 rounded-xl card-hover border border-white/5">
              <div className="text-primary text-center mb-3 flex justify-center">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-center mb-2">Produtividade</h3>
              <p className="text-sm text-center opacity-90">Análises e métricas para seu evento</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 to-background opacity-50"></div>
        
        {/* Subtle floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-40 h-40 rounded-full bg-orange-500 blur-3xl opacity-5 top-20 right-10"></div>
          <div className="absolute w-32 h-32 rounded-full bg-red-500 blur-3xl opacity-5 bottom-20 left-10"></div>
        </div>
        
        {/* Form container */}
        <div className="w-full max-w-md relative z-10 backdrop-blur-sm bg-card/60 p-8 rounded-2xl border border-border/50 shadow-xl animate-fadeIn">
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default Auth;
