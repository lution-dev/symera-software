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
      <div className="flex flex-col md:flex-row gap-6">
        {/* Coluna da esquerda - Informações do perfil */}
        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 mt-2">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    {userData?.profileImageUrl ? (
                      <AvatarImage src={userData.profileImageUrl} alt={`${userData.firstName} ${userData.lastName}`} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-primary text-white text-xl">
                      {getInitials(`${userData?.firstName || ""} ${userData?.lastName || ""}`)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-xl font-bold">
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{userData?.email}</p>
                
                <div className="w-full mt-6">
                  <Link href="/settings">
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" /> Configurações
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Membro desde</h3>
                  <p>{userData?.createdAt ? getFormattedDate(userData.createdAt) : "Data desconhecida"}</p>
                </div>
                
                {userData?.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Telefone</h3>
                    <p>{userData.phone}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Eventos organizados</h3>
                  <p>{Array.isArray(userEvents) ? userEvents.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna da direita - Abas com conteúdo dinâmico */}
        <div className="md:w-2/3">
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Atividades Recentes</CardTitle>
                  <CardDescription>
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
                <CardHeader>
                  <CardTitle className="text-lg">Próximos Eventos</CardTitle>
                  <CardDescription>
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
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                  <CardDescription>
                    Resumo da sua atividade na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Calendar className="h-8 w-8 text-primary mx-auto mb-2 mt-2" />
                        <h3 className="text-2xl font-bold">{Array.isArray(userEvents) ? userEvents.length : 0}</h3>
                        <p className="text-sm text-muted-foreground">Eventos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 text-primary mx-auto mb-2 mt-2" />
                        <h3 className="text-2xl font-bold">0</h3>
                        <p className="text-sm text-muted-foreground">Membros de Equipe</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2 mt-2" />
                        <h3 className="text-2xl font-bold">0</h3>
                        <p className="text-sm text-muted-foreground">Mensagens</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;