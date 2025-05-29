import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const LoginPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirecionar se já estiver logado
  if (user && !isLoading) {
    navigate("/");
    return null;
  }
  
  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-purple-900 to-purple-800">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Symera</h1>
            <p className="text-gray-600">
              Plataforma de organização de eventos com IA
            </p>
          </div>
          
          <Button 
            onClick={handleReplitLogin}
            className="w-full py-6 text-base font-medium transition-all bg-purple-600 hover:bg-purple-700"
          >
            Entrar com Replit
          </Button>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Ao fazer login, você concorda com nossos Termos de Serviço e Política de Privacidade.</p>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-center text-white text-sm opacity-80">
        © {new Date().getFullYear()} Symera • Todos os direitos reservados
      </p>
    </div>
  );
};

export default LoginPage;