import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/ui/logo";

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirecionamento para autenticação do Replit
  const handleAuthRedirect = () => {
    setIsLoading(true);
    window.location.href = "/api/login";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="flex items-center mb-2">
          <Logo className="h-12 w-auto mr-2" />
          <CardTitle className="text-3xl gradient-text">Symera</CardTitle>
        </div>
        <CardDescription>
          Plataforma de gerenciamento de eventos
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Bem-vindo à Symera</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha uma opção para acessar sua conta
          </p>
        </div>
        
        <Button
          onClick={handleAuthRedirect}
          className="w-full h-11"
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : "Entrar na minha conta"}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              ou
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleAuthRedirect}
          className="w-full h-11"
          disabled={isLoading}
        >
          Criar uma nova conta
        </Button>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAuthRedirect}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
                fill="currentColor"
              />
            </svg>
            Continuar com Google
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Política de Privacidade
          </a>
          .
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => navigate("/auth/verify-email")}
            className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Problemas com verificação de email?
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;