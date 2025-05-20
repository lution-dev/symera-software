import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import TaskList from "@/components/Dashboard/TaskList";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import moment from "moment";
import { apiRequest } from "@/lib/queryClient";

interface EventProps {
  id?: string;
}

const EventNew: React.FC<EventProps> = ({ id }) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Extrair o ID da URL se não recebido como prop
  const eventId = id || location.split('/')[2];
  
  // Carregar dados do evento
  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: isAuthenticated && !!eventId,
  });

  // Carregar tarefas do evento
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/tasks`],
    enabled: isAuthenticated && !!eventId,
  });

  // Carregar equipe do evento
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: isAuthenticated && !!eventId,
  });

  // Carregar atividades do evento
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/activities`],
    enabled: isAuthenticated && !!eventId,
  });

  // Mutação para atualizar o status do evento
  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      return apiRequest(`/api/events/${eventId}`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      toast({
        title: "Status atualizado",
        description: "O status do evento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do evento.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Evento não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O evento que você está procurando não existe ou você não tem permissão para acessá-lo.
          </p>
          <Button onClick={() => navigate("/events")}>Voltar para Eventos</Button>
        </div>
      </div>
    );
  }

  // Configurar as badges de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planning":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Planejamento</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Ativo</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Concluído</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Cancelado</Badge>;
      case "postponed":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Adiado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  // Converter data para exibição
  const eventDate = event.date ? new Date(event.date) : null;
  const formattedDate = eventDate ? formatDate(eventDate) : "Data não definida";
  
  // Calcular progresso das tarefas
  const completedTasks = tasks?.filter(task => task.status === "completed")?.length || 0;
  const totalTasks = tasks?.length || 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="container mx-auto py-8">
      {/* Cabeçalho do evento */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl font-bold">{event.name}</h1>
              {getStatusBadge(event.status)}
            </div>
            <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center">
                <i className="fas fa-calendar-day mr-2"></i> {formattedDate}
              </span>
              <span className="flex items-center">
                <i className="fas fa-users mr-2"></i> {event.attendees || 0} convidados
              </span>
              <span className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2"></i> {event.location || "Local não definido"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select
              defaultValue={event.status}
              onValueChange={(value) => {
                updateEventStatusMutation.mutate({ status: value });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alterar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="postponed">Adiado</SelectItem>
              </SelectContent>
            </Select>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <i className="fas fa-trash-alt mr-2"></i> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente este evento
                    e removerá seus dados de nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      // Lógica para excluir evento aqui
                      apiRequest(`/api/events/${eventId}`, {
                        method: "DELETE",
                      }).then(() => {
                        toast({
                          title: "Evento excluído",
                          description: "O evento foi excluído com sucesso.",
                        });
                        navigate("/events");
                      }).catch(() => {
                        toast({
                          title: "Erro ao excluir evento",
                          description: "Não foi possível excluir o evento.",
                          variant: "destructive",
                        });
                      });
                    }}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button variant="default" onClick={() => navigate(`/events/${eventId}/edit`)}>
              <i className="fas fa-edit mr-2"></i> Editar
            </Button>
          </div>
        </div>
        
        {/* Cards de resumo do evento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(event.budget || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Planejado para o evento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(event.expenses || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {event.expenses && event.budget ? 
                  `${Math.round((event.expenses / event.budget) * 100)}% do orçamento utilizado` : 
                  "Sem orçamento definido"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency((event.budget || 0) - (event.expenses || 0))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {event.expenses && event.budget ? 
                  `${Math.round(((event.budget - event.expenses) / event.budget) * 100)}% do orçamento restante` : 
                  "Sem orçamento definido"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {taskProgress}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTasks} de {totalTasks} tarefas concluídas
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${taskProgress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Banner do evento se houver imagem de capa */}
        {event.coverImageUrl && (
          <div 
            className="w-full h-32 md:h-48 lg:h-64 rounded-lg bg-cover bg-center mb-6 relative"
            style={{ backgroundImage: `url(${event.coverImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-lg"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-xl font-bold text-white">{event.name}</h2>
              <p className="text-white/90">{event.type}</p>
            </div>
          </div>
        )}
        
        {/* Dias restantes até o evento */}
        {eventDate && eventDate > new Date() && (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="bg-primary/10 rounded-full p-2 mr-3">
                <i className="fas fa-hourglass-half text-primary"></i>
              </div>
              <div>
                <p className="font-medium">
                  Faltam {moment(eventDate).diff(moment(), 'days')} dias para o evento
                </p>
                <p className="text-sm text-muted-foreground">
                  O evento está marcado para {formattedDate}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Menu de navegação vertical em duas colunas */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Coluna da esquerda (~260px) - Menu vertical de navegação */}
          <div className="w-full md:w-[260px] bg-card rounded-lg shadow-sm">
            <div className="p-3 border-b">
              <h2 className="font-medium text-primary">Seções do Evento</h2>
            </div>
            <div className="flex flex-col w-full space-y-1 p-2">
              <Button 
                variant={activeTab === "tasks" ? "default" : "ghost"}
                className="w-full justify-start px-4 py-3 text-left h-auto"
                onClick={() => setActiveTab("tasks")}
              >
                <i className="fas fa-tasks mr-3"></i> 
                Tarefas 
                {tasks?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{tasks.length}</span>}
              </Button>
              <Button 
                variant={activeTab === "team" ? "default" : "ghost"}
                className="w-full justify-start px-4 py-3 text-left h-auto"
                onClick={() => setActiveTab("team")}
              >
                <i className="fas fa-users mr-3"></i> 
                Equipe 
                {team?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{team.length}</span>}
              </Button>
              <Button 
                variant={activeTab === "timeline" ? "default" : "ghost"}
                className="w-full justify-start px-4 py-3 text-left h-auto"
                onClick={() => setActiveTab("timeline")}
              >
                <i className="fas fa-calendar-alt mr-3"></i> 
                Cronograma
              </Button>
              <Button 
                variant={activeTab === "activity" ? "default" : "ghost"}
                className="w-full justify-start px-4 py-3 text-left h-auto"
                onClick={() => setActiveTab("activity")}
              >
                <i className="fas fa-history mr-3"></i> 
                Atividades
                {activities?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{activities.length}</span>}
              </Button>
            </div>
          </div>
          
          {/* Coluna da direita - Conteúdo da seção selecionada */}
          <div className="flex-1">
            {/* Aba de Tarefas */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                  <h2 className="text-xl font-semibold">Checklist do Evento</h2>
                  <div className="flex flex-wrap w-full sm:w-auto gap-2">
                    <Button onClick={() => navigate(`/events/${eventId}/tasks/new`)} variant="default" className="flex-1 sm:flex-auto">
                      <i className="fas fa-plus mr-2"></i> Nova Tarefa
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/events/${eventId}/checklist`)}>
                      <i className="fas fa-external-link-alt mr-2"></i> Ver tudo
                    </Button>
                  </div>
                </div>
                
                <TaskList
                  title=""
                  tasks={tasks}
                  loading={tasksLoading}
                  showEventName={false}
                />
              </div>
            )}
            
            {/* Aba de Equipe */}
            {activeTab === "team" && (
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Equipe do Evento</h2>
                
                {teamLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : team?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map((member: any) => (
                      <div key={member.id} className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={member.user.profileImageUrl} alt={`${member.user.firstName} ${member.user.lastName}`} />
                            <AvatarFallback>{getInitials(`${member.user.firstName} ${member.user.lastName}`)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.user.firstName} {member.user.lastName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {member.role === 'organizer' ? 'Organizador' : 
                              member.role === 'assistant' ? 'Assistente' : 
                              member.role === 'vendor' ? 'Fornecedor' : 
                              member.role === 'guest' ? 'Convidado' : 'Membro'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <i className="fas fa-users text-primary text-2xl"></i>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Nenhum membro na equipe</h3>
                    <p className="text-muted-foreground mb-6">Adicione membros à equipe para colaborar no evento</p>
                    <Button onClick={() => navigate(`/events/${eventId}/team/add`)}>
                      <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Aba de Cronograma */}
            {activeTab === "timeline" && (
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Cronograma do Evento</h2>
                
                {tasksLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : tasks && tasks.filter((task: any) => task.dueDate).length > 0 ? (
                  <div className="space-y-6">
                    {/* Implementação do cronograma aqui */}
                    <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-border">
                      {tasks
                        .filter((task: any) => task.dueDate)
                        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .map((task: any, index: number) => (
                          <div key={task.id} className="relative mb-6 last:mb-0">
                            <div className="absolute -left-6 top-0 flex items-center justify-center w-8 h-8 transform -translate-x-1/2 rounded-full bg-background border-4 border-background z-10">
                              <div className={`w-5 h-5 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500' : 
                                task.status === 'in_progress' ? 'bg-amber-500' : 
                                task.status === 'todo' ? 'bg-primary' : 'bg-neutral-300'
                              }`}></div>
                            </div>
                            <div className="ml-3 bg-background rounded-lg p-4 border">
                              <div className="flex flex-col sm:flex-row justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{task.title}</p>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                                    task.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' : 
                                    task.status === 'todo' ? 'bg-primary/10 text-primary' : 'bg-neutral-300/10 text-neutral-300'
                                  }`}>
                                    {task.status === 'completed' ? 'Concluído' : 
                                    task.status === 'in_progress' ? 'Em andamento' : 
                                    task.status === 'todo' ? 'A fazer' : 'Pendente'}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                                    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                                    task.priority === 'low' ? 'bg-green-500/10 text-green-500' : 'bg-neutral-300/10 text-neutral-300'
                                  }`}>
                                    {task.priority === 'high' ? 'Alta' : 
                                    task.priority === 'medium' ? 'Média' : 
                                    task.priority === 'low' ? 'Baixa' : 'Normal'}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                <i className="fas fa-calendar-day mr-1"></i> {formatDate(task.dueDate)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <i className="fas fa-calendar-day text-primary text-2xl"></i>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Nenhuma tarefa com prazo definido</h3>
                    <p className="text-muted-foreground mb-6">Adicione tarefas com prazos para visualizar o cronograma do evento</p>
                    <Button onClick={() => navigate(`/events/${eventId}/checklist`)}>
                      <i className="fas fa-tasks mr-2"></i> Gerenciar Checklist
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Aba de Atividades */}
            {activeTab === "activity" && (
              <ActivityFeed
                activities={activities}
                loading={activitiesLoading}
                limit={10}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventNew;