import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "@/components/Dashboard/TaskList";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { formatDate, formatCurrency, calculateTaskProgress, getEventTypeLabel } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface EventProps {
  id?: string;
}

const Event: React.FC<EventProps> = ({ id }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${id}`],
    enabled: !!id && isAuthenticated,
    retry: 1
  });
  
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: [`/api/events/${id}/tasks`],
    enabled: !!id && !!event,
  });
  
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: [`/api/events/${id}/team`],
    enabled: !!id && !!event,
  });
  
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/events/${id}/activities`],
    enabled: !!id && !!event,
  });
  
  const regenerateChecklistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/events/${id}/generate-checklist`);
    },
    onSuccess: () => {
      toast({
        title: "Checklist regenerado",
        description: "O checklist foi regenerado com sucesso usando IA",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/tasks`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível regenerar o checklist. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso",
      });
      navigate("/events");
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteEvent = () => {
    if (window.confirm("Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.")) {
      deleteEventMutation.mutate();
    }
  };
  
  const handleRegenerateChecklist = () => {
    if (window.confirm("Tem certeza que deseja regenerar o checklist? Isso criará novas tarefas baseadas na IA.")) {
      regenerateChecklistMutation.mutate();
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-xl p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-calendar-times text-destructive text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Evento não encontrado</h3>
          <p className="text-muted-foreground mb-6">
            O evento que você está procurando não existe ou você não tem permissão para acessá-lo.
          </p>
          <Link href="/events">
            <Button>
              <i className="fas fa-arrow-left mr-2"></i> Voltar para Eventos
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate progress
  const progress = calculateTaskProgress(tasks || []);
  
  // Count tasks by status
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((task: any) => task.status === 'completed').length || 0;
  const inProgressTasks = tasks?.filter((task: any) => task.status === 'in_progress').length || 0;
  const todoTasks = tasks?.filter((task: any) => task.status === 'todo').length || 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Event Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mr-3">
              {getEventTypeLabel(event.type)}
            </span>
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
              event.status === 'active' ? 'bg-green-500/10 text-green-500' : 
              event.status === 'planning' ? 'bg-blue-500/10 text-blue-500' : 
              event.status === 'completed' ? 'bg-gray-500/10 text-gray-400' : 
              'bg-red-500/10 text-red-500'
            }`}>
              {event.status === 'active' ? 'Ativo' : 
              event.status === 'planning' ? 'Planejamento' : 
              event.status === 'completed' ? 'Concluído' : 'Cancelado'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
            <div className="flex items-center">
              <i className="fas fa-calendar-day mr-2 text-primary"></i>
              <span>{formatDate(event.date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                <span>{event.location}</span>
              </div>
            )}
            {event.attendees && (
              <div className="flex items-center">
                <i className="fas fa-user-friends mr-2 text-primary"></i>
                <span>{event.attendees} convidados</span>
              </div>
            )}
            {event.budget && (
              <div className="flex items-center">
                <i className="fas fa-coins mr-2 text-primary"></i>
                <span>{formatCurrency(event.budget)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
          <Link href={`/events/${id}/checklist`}>
            <Button variant="outline">
              <i className="fas fa-tasks mr-2"></i> Checklist
            </Button>
          </Link>
          <Link href={`/events/${id}/edit`}>
            <Button variant="outline">
              <i className="fas fa-edit mr-2"></i> Editar
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteEvent}>
            <i className="fas fa-trash-alt mr-2"></i> Excluir
          </Button>
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Progress Card */}
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h3 className="font-medium text-lg mb-4">Progresso do Evento</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Concluído: {progress}%</span>
            <span className="text-primary font-medium">{completedTasks}/{totalTasks} tarefas</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full mb-4">
            <div 
              className="h-full rounded-full gradient-primary" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted rounded-md p-2">
              <div className="text-lg font-bold">{todoTasks}</div>
              <div className="text-xs text-muted-foreground">A fazer</div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-lg font-bold">{inProgressTasks}</div>
              <div className="text-xs text-muted-foreground">Em progresso</div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-lg font-bold">{completedTasks}</div>
              <div className="text-xs text-muted-foreground">Concluídas</div>
            </div>
          </div>
        </div>
        
        {/* Budget Card */}
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h3 className="font-medium text-lg mb-4">Orçamento</h3>
          {event.budget ? (
            <>
              <div className="flex justify-between mb-2">
                <span>Orçamento total</span>
                <span className="font-bold">{formatCurrency(event.budget)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Gasto até o momento</span>
                <span className="font-bold">{formatCurrency(event.expenses || 0)}</span>
              </div>
              <div className="mb-1 flex justify-between text-sm">
                <span>{Math.round((event.expenses || 0) / event.budget * 100)}% utilizado</span>
                <span>{formatCurrency(event.budget - (event.expenses || 0))} disponível</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="gradient-primary h-2 rounded-full" 
                  style={{ width: `${Math.min(100, Math.round((event.expenses || 0) / event.budget * 100))}%` }}
                ></div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">Nenhum orçamento definido</p>
              <Button variant="outline" size="sm">
                <i className="fas fa-plus mr-2"></i> Adicionar Orçamento
              </Button>
            </div>
          )}
        </div>
        
        {/* Time Remaining Card */}
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h3 className="font-medium text-lg mb-4">Tempo Restante</h3>
          {event.date ? (() => {
            const eventDate = new Date(event.date);
            const today = new Date();
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return (
              <>
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold block gradient-text">
                    {diffDays <= 0 ? "0" : diffDays}
                  </span>
                  <span className="text-muted-foreground">
                    {diffDays < 0 ? "Evento realizado" : diffDays === 0 ? "Hoje!" : diffDays === 1 ? "dia restante" : "dias restantes"}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm mb-1">Data do evento</p>
                  <p className="font-medium">{formatDate(event.date)}</p>
                </div>
              </>
            );
          })() : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Data do evento não definida</p>
            </div>
          )}
        </div>
        
        {/* Team Summary Card */}
        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Equipe</h3>
            <Button variant="outline" size="sm">
              <i className="fas fa-user-plus mr-1"></i> Adicionar
            </Button>
          </div>
          {teamLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : team?.length > 0 ? (
            <div className="space-y-3">
              {team.slice(0, 3).map((member: any) => (
                <div key={member.id} className="flex items-center">
                  {member.user.profileImageUrl ? (
                    <img 
                      src={member.user.profileImageUrl} 
                      alt={`${member.user.firstName} ${member.user.lastName}`}
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <span className="text-primary text-xs font-medium">
                        {member.user.firstName?.charAt(0) || ''}
                        {member.user.lastName?.charAt(0) || ''}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.role === 'organizer' ? 'Organizador' : 
                       member.role === 'team_member' ? 'Membro da Equipe' : 
                       'Fornecedor'}
                    </p>
                  </div>
                </div>
              ))}
              {team.length > 3 && (
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todos ({team.length})
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">Nenhum membro na equipe</p>
              <Button variant="outline" size="sm">
                <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs for Tasks, Timeline, etc. */}
      <Tabs defaultValue="tasks" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="team">Equipe Completa</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Checklist do Evento</h2>
            <div className="flex gap-2">
              <Button onClick={handleRegenerateChecklist} disabled={regenerateChecklistMutation.isPending}>
                {regenerateChecklistMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i> Gerando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i> Regenerar com IA
                  </>
                )}
              </Button>
              <Link href={`/events/${id}/checklist`}>
                <Button variant="outline">
                  <i className="fas fa-external-link-alt mr-2"></i> Ver tudo
                </Button>
              </Link>
            </div>
          </div>
          
          <TaskList
            title=""
            tasks={tasks}
            loading={tasksLoading}
            showEventName={false}
          />
        </TabsContent>
        
        <TabsContent value="team">
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
                      {member.user.profileImageUrl ? (
                        <img 
                          src={member.user.profileImageUrl} 
                          alt={`${member.user.firstName} ${member.user.lastName}`}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                          <span className="text-primary font-medium">
                            {member.user.firstName?.charAt(0) || ''}
                            {member.user.lastName?.charAt(0) || ''}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.role === 'organizer' ? 'Organizador' : 
                           member.role === 'team_member' ? 'Membro da Equipe' : 
                           'Fornecedor'}
                        </p>
                      </div>
                    </div>
                    {member.user.email && (
                      <div className="mt-3 text-sm flex items-center text-muted-foreground">
                        <i className="fas fa-envelope mr-2"></i>
                        <span>{member.user.email}</span>
                      </div>
                    )}
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
                <p className="text-muted-foreground mb-6">Adicione membros para colaborar no evento</p>
                <Button>
                  <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="timeline">
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Linha do Tempo</h2>
            
            {tasksLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : tasks?.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted"></div>
                
                <div className="space-y-6">
                  {tasks
                    .filter((task: any) => !!task.dueDate)
                    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map((task: any) => {
                      const today = new Date();
                      const dueDate = new Date(task.dueDate);
                      const isPast = dueDate < today;
                      const isToday = dueDate.toDateString() === today.toDateString();
                      
                      let statusColor = "bg-muted";
                      if (task.status === "completed") {
                        statusColor = "bg-green-500";
                      } else if (isPast) {
                        statusColor = "bg-red-500";
                      } else if (isToday) {
                        statusColor = "bg-yellow-500";
                      } else if (task.status === "in_progress") {
                        statusColor = "bg-blue-500";
                      }
                      
                      return (
                        <div key={task.id} className="flex">
                          <div className="flex-shrink-0 z-10">
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full ${statusColor} shadow-lg`}>
                              <i className={`fas fa-${
                                task.status === "completed" ? "check" : 
                                isPast ? "exclamation" : 
                                task.status === "in_progress" ? "spinner" : 
                                "calendar"
                              } text-white text-xs`}></i>
                            </div>
                          </div>
                          <div className="ml-4">
                            <h3 className={`font-medium ${task.status === "completed" ? "line-through opacity-60" : ""}`}>
                              {task.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              {formatDate(task.dueDate)}
                            </p>
                            <div className="mt-2 flex items-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${getTaskStatusClass(task.status)}`}>
                                {task.status === "completed" ? "Concluída" : 
                                 task.status === "in_progress" ? "Em andamento" : 
                                 "A fazer"}
                              </span>
                              {task.priority && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getTaskPriorityClass(task.priority)}`}>
                                  {task.priority === "high" ? "Alta prioridade" : 
                                   task.priority === "medium" ? "Média prioridade" : 
                                   "Baixa prioridade"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                <p className="text-muted-foreground mb-6">Adicione tarefas com prazos para visualizar sua linha do tempo</p>
                <Link href={`/events/${id}/checklist`}>
                  <Button>
                    <i className="fas fa-tasks mr-2"></i> Gerenciar Checklist
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          <ActivityFeed
            activities={activities}
            loading={activitiesLoading}
            limit={10}
          />
        </TabsContent>
      </Tabs>
      
      {/* Description Section */}
      {event.description && (
        <div className="bg-card rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Descrição do Evento</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {event.description}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper functions for styling
const getTaskStatusClass = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-500/10 text-green-500";
    case "in_progress": return "bg-blue-500/10 text-blue-500";
    default: return "bg-gray-500/10 text-gray-400";
  }
};

const getTaskPriorityClass = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-500/10 text-red-500";
    case "medium": return "bg-yellow-500/10 text-yellow-500";
    case "low": return "bg-green-500/10 text-green-500";
    default: return "bg-gray-500/10 text-gray-400";
  }
};

export default Event;
