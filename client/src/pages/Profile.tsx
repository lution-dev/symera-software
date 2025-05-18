import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Ícones
import { Settings, Calendar, Bell, MessageSquare, Users, Clock, ChevronRight } from "lucide-react";

interface ProfileForm {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Query para buscar dados do usuário
  const { data: userData, isLoading: isLoadingUser } = useQuery<ProfileForm>({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  // Queries para estatísticas (podem ser implementadas conforme necessário)
  const { data: userEvents, isLoading: isLoadingEvents } = useQuery<any[]>({
    queryKey: ["/api/events", "user"],
    enabled: !!user,
    initialData: [],
  });

  const getFormattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return "Data desconhecida";
    }
  };

  const activities = [
    { type: "event", action: "criou", target: "Evento Corporativo XYZ", date: new Date(Date.now() - 3600000 * 24) },
    { type: "task", action: "concluiu", target: "Enviar convites", date: new Date(Date.now() - 3600000 * 72) },
    { type: "team", action: "adicionou", target: "João Silva à equipe", date: new Date(Date.now() - 3600000 * 120) },
  ];

  const upcomingEvents = [
    { id: 1, name: "Conferência Anual", date: new Date(Date.now() + 3600000 * 24 * 5), type: "conference" },
    { id: 2, name: "Workshop de Marketing", date: new Date(Date.now() + 3600000 * 24 * 10), type: "workshop" },
  ];

  const renderUpcomingEvents = () => {
    if (!upcomingEvents || upcomingEvents.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum evento próximo.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/events/new")}>
            Criar Novo Evento
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {upcomingEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <Link href={`/events/${event.id}`}>
              <div className="flex items-center p-4 cursor-pointer group">
                <div className="mr-4 bg-primary/10 rounded-full p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium group-hover:text-primary transition-colors">{event.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {format(event.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </Card>
        ))}
      </div>
    );
  };

  const renderActivities = () => {
    if (!activities || activities.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma atividade recente.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="bg-primary/10 rounded-full p-2 mt-1">
              {activity.type === "event" && <Calendar className="h-4 w-4 text-primary" />}
              {activity.type === "task" && <Clock className="h-4 w-4 text-primary" />}
              {activity.type === "team" && <Users className="h-4 w-4 text-primary" />}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Você</span> {activity.action}{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {format(activity.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoadingUser) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Cabeçalho do perfil - Sempre visível */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start relative">
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <Avatar className="h-20 w-20 border-2 border-background">
                {userData?.profileImageUrl ? (
                  <AvatarImage src={userData.profileImageUrl} alt={`${userData.firstName} ${userData.lastName}`} />
                ) : null}
                <AvatarFallback className="bg-gradient-primary text-white text-lg">
                  {getInitials(`${userData?.firstName || ""} ${userData?.lastName || ""}`)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center sm:text-left sm:ml-6">
              <h2 className="text-xl font-bold">
                {userData?.firstName} {userData?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{userData?.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <Badge variant="outline" className="bg-primary/10">
                  {userData?.phone || 'Sem telefone'}
                </Badge>
                <Badge variant="outline" className="bg-primary/10">
                  {Array.isArray(userEvents) ? `${userEvents.length} eventos` : '0 eventos'}
                </Badge>
              </div>
            </div>

            {/* Removido o botão de configurações para usar o card na visão mobile */}
          </div>

          <div className="flex flex-col space-y-3">
            <div className="text-xs text-muted-foreground text-center sm:text-right">
              Membro desde {userData?.createdAt ? getFormattedDate(userData.createdAt) : "data desconhecida"}
            </div>
            
            {/* Card de configurações para dispositivos móveis */}
            <div className="sm:hidden w-full">
              <div 
                onClick={() => navigate("/profile/configuracoes")} 
                className="flex items-center p-2 border rounded-lg hover:border-primary cursor-pointer transition-colors bg-background"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Configurações</p>
                  <p className="text-xs text-muted-foreground">Gerencie seu perfil e preferências</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas agora vêm após o cabeçalho do perfil */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="flex mb-6">
          <TabsTrigger value="activities" className="min-w-[80px] flex-1">Atividades</TabsTrigger>
          <TabsTrigger value="upcoming" className="min-w-[80px] flex-1">Eventos</TabsTrigger>
          <TabsTrigger value="stats" className="min-w-[80px] flex-1">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4 mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Atividades Recentes</CardTitle>
              <CardDescription className="text-sm">
                Histórico das suas últimas ações na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderActivities()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
              <CardDescription className="text-sm">
                Eventos que você organizará em breve
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderUpcomingEvents()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Estatísticas</CardTitle>
              <CardDescription className="text-sm">
                Resumo da sua atividade na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div onClick={() => navigate("/profile/eventos")} className="text-center p-3 bg-background border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-bold">{Array.isArray(userEvents) ? userEvents.length : 0}</h3>
                  <p className="text-xs text-muted-foreground">Eventos</p>
                </div>

                <div onClick={() => navigate("/profile/equipe")} className="text-center p-3 bg-background border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-bold">0</h3>
                  <p className="text-xs text-muted-foreground">Equipe</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div onClick={() => navigate("/profile/lembretes")} className="text-center p-3 bg-background border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <Bell className="h-5 w-5 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-bold">0</h3>
                  <p className="text-xs text-muted-foreground">Lembretes</p>
                </div>
                
                <div onClick={() => navigate("/profile/configuracoes")} className="text-center p-3 bg-background border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <Settings className="h-5 w-5 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-bold">4</h3>
                  <p className="text-xs text-muted-foreground">Configurações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;