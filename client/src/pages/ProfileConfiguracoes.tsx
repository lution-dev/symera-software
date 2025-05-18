import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Ícones
import { ChevronLeft, User, Bell, Palette, Shield, ChevronRight } from "lucide-react";

const ProfileConfiguracoes: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Opções de configuração
  const configOptions = [
    {
      icon: <User className="h-5 w-5" />,
      title: "Perfil",
      description: "Gerencie suas informações pessoais",
      path: "/profile/configuracoes/perfil"
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Notificações",
      description: "Configure como você recebe notificações",
      path: "/profile/configuracoes/notificacoes"
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: "Aparência",
      description: "Personalize a aparência da plataforma",
      path: "/profile/configuracoes/aparencia"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Segurança",
      description: "Gerencie a segurança da sua conta",
      path: "/profile/configuracoes/seguranca"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>
      
      <div className="space-y-4">
        {configOptions.map((option, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate(option.path)}
          >
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfileConfiguracoes;