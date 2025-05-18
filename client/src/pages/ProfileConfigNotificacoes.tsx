import React from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// Ícones
import { ChevronLeft, Save } from "lucide-react";

interface NotificationSettings {
  emailNotifications: boolean;
  taskReminders: boolean;
  eventUpdates: boolean;
  teamMessages: boolean;
  marketingEmails: boolean;
}

const ProfileConfigNotificacoes: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Configurações de notificações
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    emailNotifications: true,
    taskReminders: true,
    eventUpdates: true,
    teamMessages: true,
    marketingEmails: false
  });
  
  // Query para buscar dados do usuário
  const { isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });
  
  // Mutation para atualizar notificações
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      return apiRequest("/api/user/notifications", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Notificações atualizadas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      });
      navigate("/profile/configuracoes");
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar notificações",
        description: "Ocorreu um erro ao atualizar suas preferências de notificação. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Handler para atualizar notificações
  const handleUpdateNotifications = () => {
    updateNotificationsMutation.mutate(notificationSettings);
  };

  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Notificações</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Gerencie como e quando você recebe notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferências de E-mail</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Notificações por E-mail</div>
                  <div className="text-sm text-muted-foreground">
                    Receba notificações por e-mail
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, emailNotifications: checked})
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Lembretes de Tarefas</div>
                  <div className="text-sm text-muted-foreground">
                    Receba lembretes sobre tarefas próximas da data de vencimento
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.taskReminders}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, taskReminders: checked})
                  }
                  disabled={!notificationSettings.emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Atualizações de Eventos</div>
                  <div className="text-sm text-muted-foreground">
                    Receba atualizações sobre seus eventos
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.eventUpdates}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, eventUpdates: checked})
                  }
                  disabled={!notificationSettings.emailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Mensagens da Equipe</div>
                  <div className="text-sm text-muted-foreground">
                    Receba notificações sobre mensagens da equipe
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.teamMessages}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, teamMessages: checked})
                  }
                  disabled={!notificationSettings.emailNotifications}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Marketing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">E-mails de Marketing</div>
                  <div className="text-sm text-muted-foreground">
                    Receba dicas, novidades e ofertas especiais
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({...notificationSettings, marketingEmails: checked})
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={() => navigate("/profile/configuracoes")}>Cancelar</Button>
          <Button 
            onClick={handleUpdateNotifications} 
            disabled={updateNotificationsMutation.isPending}
          >
            {updateNotificationsMutation.isPending ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Salvando...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Preferências
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileConfigNotificacoes;