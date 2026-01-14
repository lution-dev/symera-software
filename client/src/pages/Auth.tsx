import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/forms/LoginForm";
import RegisterForm from "@/components/forms/RegisterForm";
import Logo from "@/components/ui/logo";
import { CheckCircle, Calendar, FileText, BarChart3, Sparkles, Users, DollarSign } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { authManager } from "@/lib/auth";

const Auth: React.FC = () => {
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = React.useState(true);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  useEffect(() => {
    const processAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('error'))) {
        console.log("[Auth] Detectado callback OAuth no hash");
        setIsProcessingCallback(true);
        
        try {
          const supabase = await getSupabase();
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("[Auth] Erro ao processar callback:", error);
            window.location.hash = '';
            setIsProcessingCallback(false);
            return;
          }
          
          if (session) {
            console.log("[Auth] Sessão encontrada, salvando...");
            authManager.saveAuthData(session);
            
            const response = await fetch("/api/auth/user", {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            
            if (response.ok) {
              console.log("[Auth] Login completo!");
              window.location.href = "/";
              return;
            }
          }
        } catch (err) {
          console.error("[Auth] Erro no callback:", err);
        }
        
        window.location.hash = '';
        setIsProcessingCallback(false);
      }
    };
    
    processAuthCallback();
  }, []);

  if (isProcessingCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processando login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side with background image and overlay */}
      <div className="hidden md:block md:w-5/12 lg:w-6/12 relative overflow-hidden">
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
          <div className="absolute w-16 h-16 rounded-full bg-orange-500 blur-3xl opacity-10 top-10 left-10 animate-pulse"></div>
          <div className="absolute w-24 h-24 rounded-full bg-red-500 blur-3xl opacity-10 bottom-20 right-10 animate-pulse" style={{animationDelay: "1s"}}></div>
          <div className="absolute w-20 h-20 rounded-full bg-orange-500 blur-3xl opacity-10 top-1/2 left-1/3 animate-pulse" style={{animationDelay: "2s"}}></div>
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-full p-6 text-white animate-fadeIn">
            {/* Logo and Title */}
            <div className="mb-4 lg:mb-6 relative flex flex-col items-center">
              <Logo className="h-14 lg:h-20 w-auto" />
              <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 text-orange-500">
                <Sparkles className="h-4 lg:h-5 w-4 lg:w-5 animate-pulse-border" />
              </div>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-bold mb-2 lg:mb-4 gradient-text text-center">Symera</h1>
            <p className="text-center mb-4 lg:mb-8 text-base lg:text-lg px-4">
              Faz parte do seu dia-a-dia, faz parte do seu evento!
            </p>
            
            {/* Feature Cards - Adjust for different screen sizes */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4 w-full px-4 max-w-lg mx-auto">
              {/* Card 1 */}
              <div className="bg-black/20 backdrop-blur-md p-3 lg:p-4 rounded-xl card-hover border border-white/5">
                <div className="text-primary text-center mb-2 flex justify-center">
                  <CheckCircle className="h-5 lg:h-6 w-5 lg:w-6" />
                </div>
                <h3 className="font-semibold text-center mb-1 text-sm">Organização sem estresse</h3>
                <p className="text-xs text-center opacity-90">Tenha controle total do seu evento.</p>
              </div>
              
              {/* Card 2 */}
              <div className="bg-black/20 backdrop-blur-md p-3 lg:p-4 rounded-xl card-hover border border-white/5">
                <div className="text-primary text-center mb-2 flex justify-center">
                  <Calendar className="h-5 lg:h-6 w-5 lg:w-6" />
                </div>
                <h3 className="font-semibold text-center mb-1 text-sm">Planejamento eficaz</h3>
                <p className="text-xs text-center opacity-90">Checklists inteligentes.</p>
              </div>
              
              {/* Card 3 */}
              <div className="bg-black/20 backdrop-blur-md p-3 lg:p-4 rounded-xl card-hover border border-white/5">
                <div className="text-primary text-center mb-2 flex justify-center">
                  <Users className="h-5 lg:h-6 w-5 lg:w-6" />
                </div>
                <h3 className="font-semibold text-center mb-1 text-sm">Mais profissionalismo</h3>
                <p className="text-xs text-center opacity-90">Entrega de alto padrão.</p>
              </div>
              
              {/* Card 4 */}
              <div className="bg-black/20 backdrop-blur-md p-3 lg:p-4 rounded-xl card-hover border border-white/5">
                <div className="text-primary text-center mb-2 flex justify-center">
                  <DollarSign className="h-5 lg:h-6 w-5 lg:w-6" />
                </div>
                <h3 className="font-semibold text-center mb-1 text-sm">Pronto para crescer</h3>
                <p className="text-xs text-center opacity-90">De pequenos a grandes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-background relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 to-background opacity-50 pointer-events-none"></div>
        
        {/* Subtle floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-40 h-40 rounded-full bg-orange-500 blur-3xl opacity-5 top-20 right-10"></div>
          <div className="absolute w-32 h-32 rounded-full bg-red-500 blur-3xl opacity-5 bottom-20 left-10"></div>
        </div>
        
        {/* Form container */}
        <div className="relative z-20 w-full max-w-md">
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default Auth;
