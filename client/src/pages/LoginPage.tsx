import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const LoginPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const { toast } = useToast();
  
  // Redirecionar se já estiver logado
  if (user && !isLoading) {
    window.location.href = "/";
    return null;
  }
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um endereço de e-mail válido",
        variant: "destructive"
      });
      return;
    }
    
    setLoginLoading(true);
    try {
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email }),
        credentials: "include"
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        toast({
          title: "Login bem-sucedido!",
          description: "Bem-vindo de volta ao EventMaster."
        });
        navigate("/");
      } else {
        throw new Error("Falha no login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: "Não foi possível fazer login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoginLoading(false);
    }
  };
  
  // Funções para login com Google e Apple
  const handleGoogleLogin = () => {
    window.location.href = "/api/login/google";
  };
  
  const handleAppleLogin = () => {
    window.location.href = "/api/login/apple";
  };
  
  // Login padrão do sistema (Replit)
  const handleDefaultLogin = () => {
    window.location.href = "/api/login";
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-purple-900 to-purple-800">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">EventMaster</h1>
            <p className="text-gray-600">
              Gerencie seus eventos com inteligência artificial
            </p>
          </div>
          
          {/* Botões de login social */}
          <div className="space-y-3 mb-6">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 py-6 border-2"
              onClick={handleGoogleLogin}
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              <span>Entrar com Google</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 py-6 border-2"
              onClick={handleAppleLogin}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Entrar com Apple</span>
            </Button>
          </div>
          
          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
              ou
            </span>
          </div>
          
          {/* Formulário de login por e-mail */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 py-6" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-6 text-base font-medium transition-all bg-purple-600 hover:bg-purple-700" 
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Entrando...
                </>
              ) : (
                "Entrar com E-mail"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Ao fazer login, você concorda com nossos Termos de Serviço e Política de Privacidade.</p>
          </div>
        </div>
        
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-center text-gray-600">
            Precisa de ajuda? Entre em contato com nossa equipe de suporte.
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-center text-white text-sm opacity-80">
        © {new Date().getFullYear()} EventMaster • Todos os direitos reservados
      </p>
      
      {/* Link escondido para login padrão do sistema */}
      <button 
        onClick={handleDefaultLogin} 
        className="mt-2 text-xs text-white/40 hover:text-white/60 transition-colors hidden"
      >
        Login institucional
      </button>
    </div>
  );
};

export default LoginPage;