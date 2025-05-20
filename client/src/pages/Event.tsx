import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TaskList from "@/components/Dashboard/TaskList";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { formatDate, formatCurrency, calculateTaskProgress, getEventTypeLabel, getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
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
import { AlertTriangle, Calendar, MapPin, DollarSign, Users } from "lucide-react";

interface EventProps {
  id?: string;
}

const Event: React.FC<EventProps> = ({ id }) => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState("tasks");

  // Extract ID from URL if not provided as prop
  const eventId = id || location.split("/").pop();

  // Event data query
  const { 
    data: event,
    error: eventError,
    isLoading: eventLoading,
  } = useQuery({
    queryKey: ['/api/events', eventId],
    enabled: !!eventId && isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Vendors query
  const { 
    data: vendors = [],
    error: vendorsError,
  } = useQuery({
    queryKey: ['/api/events', eventId, 'vendors'],
    enabled: !!eventId && isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Budget items query
  const { 
    data: budgetItems = [],
    error: budgetError,
  } = useQuery({
    queryKey: ['/api/events', eventId, 'budget'],
    enabled: !!eventId && isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Task query
  const { 
    data: tasks = [],
    error: tasksError,
  } = useQuery({
    queryKey: ['/api/events', eventId, 'tasks'],
    enabled: !!eventId && isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Team members query
  const { 
    data: teamMembers = [],
    error: teamError,
  } = useQuery({
    queryKey: ['/api/events', eventId, 'team'],
    enabled: !!eventId && isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Activity logs query
  const { 
    data: activityLogs = [],
    error: logsError,
  } = useQuery({
    queryKey: ['/api/events', eventId, 'activities'],
    enabled: !!eventId && isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => {
      return apiRequest(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      toast({
        title: "Status atualizado",
        description: "O status do evento foi atualizado com sucesso.",
      });
      setStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do evento.",
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: () => {
      return apiRequest(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      navigate("/events");
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir evento",
        description: "Não foi possível excluir o evento.",
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (eventLoading) {
    return (
      <div className="container mx-auto pt-6 px-4 sm:px-6">
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-60 bg-muted rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-muted rounded-xl"></div>
            <div className="h-20 bg-muted rounded-xl"></div>
            <div className="h-20 bg-muted rounded-xl"></div>
          </div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <div className="container mx-auto pt-6 px-4 sm:px-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          <p className="font-medium">Erro ao carregar dados do evento</p>
          <p>Não foi possível obter as informações deste evento. Tente novamente mais tarde.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/events")}>
            Voltar para eventos
          </Button>
        </div>
      </div>
    );
  }

  // Calculate task progress
  const progress = calculateTaskProgress(tasks);
  
  // Calculate total budget and expenses
  const totalBudget = budgetItems.reduce((sum, item) => sum + Number(item.estimatedCost), 0);
  const totalExpenses = budgetItems.reduce((sum, item) => sum + Number(item.actualCost || 0), 0);

  // Handle status change
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const confirmStatusChange = () => {
    if (selectedStatus) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      {event.needsAttention && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <p>{(event as any).warningMessage}</p>
          </div>
        </div>
      )}
      
      {/* Two-card layout at the top - Grid with 1:1 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Card - Event Banner with Info (Preserving original styling) */}
        <div className="bg-card rounded-xl mb-6 md:mb-0 shadow-sm overflow-hidden">
          <div 
            className="relative h-[200px] md:h-[260px] bg-cover bg-center" 
            style={{ backgroundImage: event.coverImage ? `url(${event.coverImage})` : 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-foreground)))' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 flex flex-col justify-end p-5">
              {/* Cabeçalho com status - mantendo estilo original */}
              <div className="space-y-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  event.status === 'planning' ? 'bg-[hsl(var(--event-planning))]/15 text-[hsl(var(--event-planning))]' : 
                  event.status === 'confirmed' ? 'bg-[hsl(var(--event-confirmed))]/15 text-[hsl(var(--event-confirmed))]' : 
                  event.status === 'in_progress' ? 'bg-[hsl(var(--event-in-progress))]/15 text-[hsl(var(--event-in-progress))]' : 
                  event.status === 'active' ? 'bg-[hsl(var(--event-in-progress))]/15 text-[hsl(var(--event-in-progress))]' : 
                  event.status === 'completed' ? 'bg-[hsl(var(--event-completed))]/15 text-[hsl(var(--event-completed))]' : 
                  event.status === 'cancelled' ? 'bg-[hsl(var(--event-cancelled))]/15 text-[hsl(var(--event-cancelled))]' : 
                  'bg-[hsl(var(--event-planning))]/15 text-[hsl(var(--event-planning))]'
                }`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                    event.status === 'planning' ? 'bg-[hsl(var(--event-planning))]' : 
                    event.status === 'confirmed' ? 'bg-[hsl(var(--event-confirmed))]' : 
                    event.status === 'in_progress' ? 'bg-[hsl(var(--event-in-progress))]' : 
                    event.status === 'active' ? 'bg-[hsl(var(--event-in-progress))]' : 
                    event.status === 'completed' ? 'bg-[hsl(var(--event-completed))]' : 
                    event.status === 'cancelled' ? 'bg-[hsl(var(--event-cancelled))]' : 
                    'bg-[hsl(var(--event-planning))]'
                  }`}></span>
                  {event.status === 'planning' ? 'Planejamento' : 
                  event.status === 'confirmed' ? 'Confirmado' : 
                  event.status === 'in_progress' ? 'Em andamento' : 
                  event.status === 'active' ? 'Ativo' : 
                  event.status === 'completed' ? 'Concluído' : 
                  event.status === 'cancelled' ? 'Cancelado' : 
                  'Planejamento'}
                </span>
                
                <h1 className="text-2xl font-semibold text-white tracking-tight">{event.name}</h1>
                <div className="text-white/80">{getEventTypeLabel(event.type)}</div>
                {event.description && (
                  <p className="text-sm text-white/70 line-clamp-2 mt-1">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - Event Details */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="p-5">
            <h2 className="text-xl font-semibold mb-4">Detalhes do Evento</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Data e Hora</div>
                  <div className="text-muted-foreground text-sm">
                    {formatDate(new Date(event.date))}
                    {event.time && <span> às {event.time}</span>}
                  </div>
                </div>
              </li>
              {event.location && (
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Local</div>
                    <div className="text-muted-foreground text-sm">{event.location}</div>
                  </div>
                </li>
              )}
              <li className="flex items-start">
                <DollarSign className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Orçamento Estimado</div>
                  <div className="text-muted-foreground text-sm">{formatCurrency(event.budget || 0)}</div>
                </div>
              </li>
              {event.guestCount && (
                <li className="flex items-start">
                  <Users className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Convidados</div>
                    <div className="text-muted-foreground text-sm">{event.guestCount} pessoas</div>
                  </div>
                </li>
              )}
            </ul>
            <div className="mt-4 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ações
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/events/${eventId}/edit`)}>
                    Editar Evento
                  </DropdownMenuItem>
                  <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        setStatusDialogOpen(true);
                      }}>
                        Alterar Status
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Alterar status do evento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Selecione o novo status para o evento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Select defaultValue={event.status} onValueChange={handleStatusChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Status do Evento</SelectLabel>
                              <SelectItem value="planning">Planejamento</SelectItem>
                              <SelectItem value="confirmed">Confirmado</SelectItem>
                              <SelectItem value="in_progress">Em andamento</SelectItem>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusChange}>Confirmar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                        Excluir Evento
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento e todos os dados associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteEventMutation.mutate()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Indicator Cards - Mantendo o design original */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Progress Card */}
        <div className="bg-card rounded-xl shadow-sm">
          <div className="p-5">
            <h3 className="font-medium mb-2">Progresso</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {tasks.filter(t => t.completed).length} de {tasks.length} tarefas concluídas
              </span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-card rounded-xl shadow-sm">
          <div className="p-5">
            <h3 className="font-medium mb-2">Gestão Financeira</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Gasto {formatCurrency(totalExpenses)} de {formatCurrency(totalBudget)}
              </span>
              <span className="text-sm font-medium">
                {totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full ${totalExpenses <= totalBudget ? 'bg-emerald-500' : 'bg-destructive'}`}
                style={{ width: `${totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-card rounded-xl shadow-sm">
          <div className="p-5">
            <h3 className="font-medium mb-2">Cronograma</h3>
            <div className="flex items-center">
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Data do evento</span>
                  <span className="text-sm font-medium">{formatDate(new Date(event.date))}</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full">
                  {event.status !== 'cancelled' && (
                    <div 
                      className={`h-full rounded-full ${
                        event.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ 
                        width: `${
                          event.status === 'planning' ? '20%' : 
                          event.status === 'confirmed' ? '40%' : 
                          event.status === 'in_progress' ? '60%' : 
                          event.status === 'active' ? '80%' : 
                          event.status === 'completed' ? '100%' : '20%'
                        }`
                      }}
                    ></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Tabs Navigation and Content */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Mobile View: Horizontal TabsList */}
        <div className="md:hidden">
          <Tabs defaultValue="tasks" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
              <TabsTrigger value="schedule">Agenda</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Desktop View: Vertical Navigation Menu */}
        <div className="hidden md:block">
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
              <Tabs defaultValue="tasks" orientation="vertical" className="flex flex-col h-full" onValueChange={setActiveTab}>
                <TabsList className="flex flex-col h-auto justify-start">
                  <TabsTrigger value="tasks" className="justify-start w-full mb-1">
                    <div className="flex items-center">
                      <i className="fas fa-tasks mr-2.5 text-sm"></i>
                      <span>Tarefas</span>
                      {tasks.length > 0 && (
                        <Badge className="ml-2">{tasks.length}</Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="justify-start w-full mb-1">
                    <div className="flex items-center">
                      <i className="fas fa-users mr-2.5 text-sm"></i>
                      <span>Equipe</span>
                      {teamMembers.length > 0 && (
                        <Badge className="ml-2">{teamMembers.length}</Badge>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="justify-start w-full mb-1">
                    <div className="flex items-center">
                      <i className="fas fa-calendar-alt mr-2.5 text-sm"></i>
                      <span>Cronograma</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="justify-start w-full">
                    <div className="flex items-center">
                      <i className="fas fa-history mr-2.5 text-sm"></i>
                      <span>Atividades</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Tab Content Area - mantendo design original */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            {activeTab === "tasks" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Tarefas</h3>
                  <Button size="sm" onClick={() => navigate(`/events/${eventId}/tasks/new`)}>
                    Nova Tarefa
                  </Button>
                </div>
                <TaskList 
                  tasks={tasks} 
                  eventId={Number(eventId)} 
                  teamMembers={teamMembers} 
                  refetchTasks={() => queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'tasks'] })}
                />
              </div>
            )}

            {activeTab === "team" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Equipe</h3>
                  <Button size="sm" onClick={() => navigate(`/events/${eventId}/team`)}>
                    Gerenciar Equipe
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.user.id} className="flex items-center p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                      <Avatar className="h-10 w-10 mr-3">
                        {member.user.profilePicture ? (
                          <AvatarImage src={member.user.profilePicture} alt={member.user.name} />
                        ) : (
                          <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.user.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role || 'Membro'}</div>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <div className="col-span-full text-center py-6 text-muted-foreground">
                      <p>Nenhum membro adicionado. Clique em "Gerenciar Equipe" para adicionar membros.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Cronograma</h3>
                  <Button size="sm" onClick={() => navigate(`/events/${eventId}/schedule`)}>
                    Ver Cronograma
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-muted p-3 border-b">
                      <h4 className="font-medium">Marcos Importantes</h4>
                    </div>
                    <div className="p-3">
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-3">
                          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                          <div>
                            <p className="font-medium">Data do Evento</p>
                            <p className="text-sm text-muted-foreground">{formatDate(new Date(event.date))}</p>
                          </div>
                        </li>
                        {tasks
                          .filter(task => task.priority === 'high')
                          .slice(0, 3)
                          .map(task => (
                            <li key={task.id} className="flex items-start space-x-3">
                              <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                                task.completed ? 'bg-green-500' : 'bg-amber-500'
                              } flex items-center justify-center`}>
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              </div>
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {task.dueDate ? formatDate(new Date(task.dueDate)) : 'Sem data'}
                                  {task.completed && ' - Concluído'}
                                </p>
                              </div>
                            </li>
                          ))}
                        {tasks.filter(task => task.priority === 'high').length === 0 && (
                          <li className="text-center py-2 text-muted-foreground text-sm">
                            <p>Nenhuma tarefa prioritária definida.</p>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activities" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Atividades Recentes</h3>
                </div>
                <ActivityFeed activities={activityLogs} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event;