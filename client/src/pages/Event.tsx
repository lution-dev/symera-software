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
import { AlertTriangle } from "lucide-react";
import EventTabs from "@/components/Event/EventTabs";

interface EventProps {
  id?: string;
}

const Event: React.FC<EventProps> = ({ id }) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Extrair o ID da URL se não recebido como prop
  const eventId = id || location.split('/')[2];
  
  console.log("[Debug] ID do evento recebido como prop:", id);
  console.log("[Debug] ID do evento extraído da URL:", eventId);
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated,
    retry: 1
  });
  
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/tasks`],
    enabled: !!eventId && !!event,
  });
  
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId && !!event,
  });
  
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/activities`],
    enabled: !!eventId && !!event,
  });
  
  const regenerateChecklistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/events/${eventId}/generate-checklist`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Checklist regenerado",
        description: "O checklist foi regenerado com sucesso usando IA",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/tasks`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível regenerar o checklist. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation para atualizar o status do evento
  const updateEventStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return apiRequest(`/api/events/${eventId}`, { 
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status do evento foi atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      
      // O registro de atividade já é feito no backend
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/activities`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do evento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/events/${eventId}`, {
        method: "DELETE"
      });
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

  // Função para obter imagem de capa padrão com base no tipo de evento - usando as mesmas do EventCard
  const getDefaultCover = () => {
    switch (event.type) {
      case 'wedding':
        return 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      case 'corporate':
        return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      case 'birthday':
        return 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      case 'conference':
        return 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      case 'social':
        return 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
      default:
        return 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 mobile-spacing">
      {/* Breadcrumb Navigation - visível em desktop e tablet, mas oculto em mobile */}
      <nav className="hidden sm:flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <i className="fas fa-home mr-2"></i>
              Início
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <i className="fas fa-chevron-right text-muted-foreground text-xs mx-2"></i>
              <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground">
                Eventos
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <i className="fas fa-chevron-right text-muted-foreground text-xs mx-2"></i>
              <span className="text-sm font-medium text-primary truncate max-w-[150px]">
                {event.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>
      
      {/* Layout de dois cards lado a lado (1:1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 sm:mb-6">
        {/* Card da esquerda - Mantém o design atual mas encapsulado como um card lateral */}
        <div className="relative rounded-xl overflow-hidden shadow-md h-48 sm:h-64 md:h-[220px]">
          <img 
            src={event.coverImageUrl || getDefaultCover()}
            alt={`${event.name} - ${getEventTypeLabel(event.type)}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/70 sm:from-background/95 sm:to-background/30"></div>
          <div className="absolute bottom-0 left-0 p-3 sm:p-6">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-block px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                {getEventTypeLabel(event.type)}
              </span>
              <span className={`inline-block px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                event.status === 'planning' ? 'bg-[hsl(var(--event-planning))]/10 text-[hsl(var(--event-planning))]' : 
                event.status === 'confirmed' ? 'bg-[hsl(var(--event-confirmed))]/10 text-[hsl(var(--event-confirmed))]' : 
                event.status === 'in_progress' ? 'bg-[hsl(var(--event-in-progress))]/10 text-[hsl(var(--event-in-progress))]' : 
                event.status === 'active' ? 'bg-[hsl(var(--event-in-progress))]/10 text-[hsl(var(--event-in-progress))]' : 
                event.status === 'completed' ? 'bg-[hsl(var(--event-completed))]/10 text-[hsl(var(--event-completed))]' : 
                event.status === 'cancelled' ? 'bg-[hsl(var(--event-cancelled))]/10 text-[hsl(var(--event-cancelled))]' : 
                'bg-[hsl(var(--event-planning))]/10 text-[hsl(var(--event-planning))]'
              }`}>
                {event.status === 'planning' ? 'Planejamento' : 
                event.status === 'confirmed' ? 'Confirmado' : 
                event.status === 'in_progress' ? 'Em andamento' : 
                event.status === 'active' ? 'Ativo' : 
                event.status === 'completed' ? 'Concluído' : 
                event.status === 'cancelled' ? 'Cancelado' : 
                'Planejamento'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md line-clamp-2">{event.name}</h1>
            {event.description && (
              <p className="text-white/90 text-sm sm:text-base drop-shadow-md mt-2 line-clamp-3 max-w-xl">
                {event.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Card da direita - Informações do evento em formato de lista */}
        <div className="bg-card rounded-xl shadow-md p-5 flex flex-col h-48 sm:h-64 md:h-[220px]">
          <div className="flex justify-between items-start mb-5">
            <h2 className="text-lg font-semibold">Detalhes do Evento</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <i className="fas fa-ellipsis-v"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/events/${eventId}/edit`)}>
                  <i className="fas fa-edit mr-2 text-muted-foreground"></i> Editar Evento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/events/${eventId}/team/add`)}>
                  <i className="fas fa-user-plus mr-2 text-muted-foreground"></i> Adicionar Membro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRegenerateChecklist}>
                  <i className="fas fa-sync-alt mr-2 text-muted-foreground"></i> Regenerar Checklist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteEvent} className="text-destructive focus:text-destructive">
                  <i className="fas fa-trash-alt mr-2"></i> Excluir Evento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="grid grid-cols-2 gap-3 xs:gap-4 mb-1">
            {/* Coluna da esquerda */}
            <div className="space-y-3 xs:space-y-4">
              {/* Data do evento */}
              <div className="flex items-start">
                <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary">
                  <i className="fas fa-calendar-day text-sm"></i>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="mt-0.5 text-sm font-medium">{formatDate(event.date)}</p>
                </div>
              </div>
              
              {/* Número de convidados */}
              {event.attendees && (
                <div className="flex items-start">
                  <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary">
                    <i className="fas fa-user-friends text-sm"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-muted-foreground">Convidados</p>
                    <p className="mt-0.5 text-sm font-medium">{event.attendees}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Coluna da direita */}
            <div className="space-y-3 xs:space-y-4">
              {/* Local do evento */}
              {event.location && (
                <div className="flex items-start">
                  <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary">
                    <i className="fas fa-map-marker-alt text-sm"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-muted-foreground">Local</p>
                    <p className="mt-0.5 text-sm font-medium overflow-hidden text-ellipsis">{event.location}</p>
                  </div>
                </div>
              )}
              
              {/* Orçamento */}
              {event.budget && (
                <div className="flex items-start">
                  <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary">
                    <i className="fas fa-money-bill-wave text-sm"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-muted-foreground">Orçamento</p>
                    <p className="mt-0.5 text-sm font-medium">{formatCurrency(event.budget)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Status do evento com seletor de status (dropdown) */}
          <div className="mt-auto">
            <p className="text-xs text-muted-foreground mb-1.5">Status</p>
            <Select 
              value={event.status}
              onValueChange={(value) => {
                if (value !== event.status) {
                  updateEventStatusMutation.mutate(value);
                }
              }}
            >
              <SelectTrigger className={`
                h-9 w-full border border-input px-3 py-1
                ${event.status === 'planning' ? 'bg-[hsl(var(--event-planning))]/10 text-[hsl(var(--event-planning))]' : 
                event.status === 'confirmed' ? 'bg-[hsl(var(--event-confirmed))]/10 text-[hsl(var(--event-confirmed))]' : 
                event.status === 'in_progress' ? 'bg-[hsl(var(--event-in-progress))]/10 text-[hsl(var(--event-in-progress))]' : 
                event.status === 'active' ? 'bg-[hsl(var(--event-in-progress))]/10 text-[hsl(var(--event-in-progress))]' : 
                event.status === 'completed' ? 'bg-[hsl(var(--event-completed))]/10 text-[hsl(var(--event-completed))]' : 
                event.status === 'cancelled' ? 'bg-[hsl(var(--event-cancelled))]/10 text-[hsl(var(--event-cancelled))]' : 
                'bg-[hsl(var(--event-planning))]/10 text-[hsl(var(--event-planning))]'}
              `}>
                <SelectValue placeholder="Selecionar status">
                  {event.status === 'planning' ? 'Planejamento' : 
                  event.status === 'confirmed' ? 'Confirmado' : 
                  event.status === 'in_progress' ? 'Em andamento' : 
                  event.status === 'active' ? 'Ativo' : 
                  event.status === 'completed' ? 'Concluído' : 
                  event.status === 'cancelled' ? 'Cancelado' : 
                  'Planejamento'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="planning" className="bg-[hsl(var(--event-planning))]/10 text-[hsl(var(--event-planning))]">
                    Planejamento
                  </SelectItem>
                  <SelectItem value="confirmed" className="bg-[hsl(var(--event-confirmed))]/10 text-[hsl(var(--event-confirmed))]">
                    Confirmado
                  </SelectItem>
                  <SelectItem value="in_progress" className="bg-[hsl(var(--event-in-progress))]/10 text-[hsl(var(--event-in-progress))]">
                    Em andamento
                  </SelectItem>
                  <SelectItem value="completed" className="bg-[hsl(var(--event-completed))]/10 text-[hsl(var(--event-completed))]">
                    Concluído
                  </SelectItem>
                  <SelectItem value="cancelled" className="bg-[hsl(var(--event-cancelled))]/10 text-[hsl(var(--event-cancelled))]">
                    Cancelado
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Resumo financeiro, se tiver orçamento definido */}
      {event.budget && (
        <div className="bg-card rounded-xl p-3 sm:p-5 shadow-md mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Resumo Financeiro</h2>
            <Link href={`/events/${eventId}/budget`}>
              <Button variant="outline" size="sm">
                <i className="fas fa-external-link-alt mr-2"></i> Ver detalhes
              </Button>
            </Link>
          </div>
          
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Orçamento Total</p>
              <p className="text-lg font-semibold">{formatCurrency(event.budget)}</p>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-lg font-semibold">{formatCurrency(event.expenses || 0)}</p>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className={`text-lg font-semibold ${
                ((event.budget || 0) - (event.expenses || 0)) < 0 
                  ? 'text-red-500' 
                  : 'text-green-500'
              }`}>
                {formatCurrency((event.budget || 0) - (event.expenses || 0))}
              </p>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Utilizado</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${
                      ((event.expenses || 0) / (event.budget || 1)) > 1 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                    } h-2 rounded-full`}
                    style={{ 
                      width: `${Math.min(((event.expenses || 0) / (event.budget || 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {Math.round(((event.expenses || 0) / (event.budget || 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Caixa de alerta - se a data estiver próxima (7 dias) e o evento não estiver finalizado */}
      {event.date && !['completed', 'cancelled'].includes(event.status) && new Date(event.date) > new Date() && new Date(event.date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 && (
        <div className="bg-[hsl(var(--event-in-progress))]/10 border border-[hsl(var(--event-in-progress))]/20 text-[hsl(var(--event-in-progress))] rounded-xl p-4 mb-4 sm:mb-6 flex items-start">
          <AlertTriangle className="w-5 h-5 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold">O evento está se aproximando!</h3>
            <p className="text-sm mt-1">
              Faltam {Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))} dias para o evento. 
              Verifique se todas as tarefas importantes foram concluídas.
            </p>
          </div>
        </div>
      )}
      
      {/* Caixa de progresso - mostrar o progresso do evento baseado nas tarefas */}
      <div className="bg-card rounded-xl p-4 sm:p-5 shadow-md mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold mb-4">Progresso do Evento</h2>
        
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Barra de progresso */}
          <div className="flex-1">
            <div className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium">Progresso da preparação</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{progress}% concluído</span>
              <span className="text-xs text-muted-foreground">Meta: 100%</span>
            </div>
          </div>
          
          {/* Estatísticas de tarefas */}
          <div className="flex justify-around sm:justify-end gap-3 sm:gap-4 flex-wrap sm:flex-nowrap mt-2 sm:mt-0">
            <div className="flex flex-col items-center">
              <div className="text-lg sm:text-xl font-semibold text-primary">{totalTasks}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg sm:text-xl font-semibold text-green-500">{completedTasks}</div>
              <div className="text-xs text-muted-foreground">Concluído</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg sm:text-xl font-semibold text-blue-500">{inProgressTasks}</div>
              <div className="text-xs text-muted-foreground">Em andamento</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg sm:text-xl font-semibold text-gray-400">{todoTasks}</div>
              <div className="text-xs text-muted-foreground">A fazer</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navegação por abas vertical em formato de 2 colunas */}
      <div className="mb-8">
        <Tabs defaultValue="tasks">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Coluna da esquerda (~260px) - Menu vertical com abas */}
            <div className="w-full md:w-[260px] bg-card rounded-lg shadow-sm">
              <div className="p-3 border-b">
                <h2 className="font-medium text-primary">Seções do Evento</h2>
              </div>
              {/* Corrigindo o TabsList para estar dentro de um componente Tabs */}
              <TabsList className="flex flex-col w-full space-y-1 p-2">
                <TabsTrigger value="tasks" className="w-full justify-start px-4 py-3 text-left">
                  <i className="fas fa-tasks mr-3"></i> 
                  Tarefas 
                  {tasks?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{tasks.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="team" className="w-full justify-start px-4 py-3 text-left">
                  <i className="fas fa-users mr-3"></i> 
                  Equipe 
                  {team?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{team.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="timeline" className="w-full justify-start px-4 py-3 text-left">
                  <i className="fas fa-calendar-alt mr-3"></i> 
                  Cronograma
                </TabsTrigger>
                <TabsTrigger value="activity" className="w-full justify-start px-4 py-3 text-left">
                  <i className="fas fa-history mr-3"></i> 
                  Atividades
                  {activities?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{activities.length}</span>}
                </TabsTrigger>
              </TabsList>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <i className="fas fa-bars mr-2"></i> Seções
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem className="cursor-pointer" onSelect={() => document.querySelector('[data-state="inactive"][value="tasks"]')?.click()}>
                  <i className="fas fa-tasks mr-2"></i> Tarefas
                  {tasks?.length > 0 && <span className="ml-auto bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{tasks.length}</span>}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => document.querySelector('[data-state="inactive"][value="team"]')?.click()}>
                  <i className="fas fa-users mr-2"></i> Equipe
                  {team?.length > 0 && <span className="ml-auto bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{team.length}</span>}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => document.querySelector('[data-state="inactive"][value="timeline"]')?.click()}>
                  <i className="fas fa-calendar-alt mr-2"></i> Cronograma
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => document.querySelector('[data-state="inactive"][value="activity"]')?.click()}>
                  <i className="fas fa-history mr-2"></i> Atividades
                  {activities?.length > 0 && <span className="ml-auto bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{activities.length}</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="bg-card rounded-lg flex-1 overflow-hidden">
              <TabsContent value="tasks">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
                    <h2 className="text-xl font-semibold">Checklist</h2>
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
              </TabsContent>
              <TabsContent value="team">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
                    <h2 className="text-xl font-semibold">Membros da Equipe</h2>
                    <Button onClick={() => navigate(`/events/${eventId}/team/add`)} variant="default">
                      <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                    </Button>
                  </div>
                  
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
                                  {getInitials(`${member.user.firstName} ${member.user.lastName}`)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{member.user.firstName} {member.user.lastName}</p>
                              <p className="text-sm text-muted-foreground">
                                {member.role === 'organizer' ? 'Organizador' : 
                                 member.role === 'team_member' ? 'Membro da Equipe' : 
                                 member.role === 'vendor' ? 'Fornecedor' : 
                                 member.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <i className="fas fa-users text-2xl text-primary"></i>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Nenhum membro na equipe</h3>
                      <p className="text-muted-foreground mb-6">
                        Adicione membros à equipe para colaborar no evento.
                      </p>
                      <Button onClick={() => navigate(`/events/${eventId}/team/add`)}>
                        <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="timeline">
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl font-semibold mb-6">Cronograma do Evento</h2>
                  
                  {tasksLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : tasks?.length > 0 ? (
                    <div className="relative pl-8">
                      <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted"></div>
                      
                      {tasks
                        .filter((task: any) => task.dueDate)
                        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .map((task: any, index: number) => {
                          const taskDate = new Date(task.dueDate);
                          const today = new Date();
                          
                          // Verificar se a tarefa está atrasada
                          const isOverdue = taskDate < today && task.status !== 'completed';
                          
                          return (
                            <div key={task.id} className="mb-6 relative">
                              <div className={`w-6 h-6 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500' : 
                                task.status === 'in_progress' ? 'bg-blue-500' : 
                                isOverdue ? 'bg-red-500' : 'bg-gray-300'
                              } absolute left-[-19px] top-0 flex items-center justify-center text-white text-xs z-10`}>
                                {task.status === 'completed' ? <i className="fas fa-check"></i> : 
                                task.status === 'in_progress' ? <i className="fas fa-circle-notch"></i> : 
                                isOverdue ? <i className="fas fa-exclamation"></i> : <i className="fas fa-circle"></i>}
                              </div>
                              
                              <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusClass(task.status)}`}>
                                        {task.status === 'completed' ? 'Concluído' : 
                                        task.status === 'in_progress' ? 'Em andamento' : 
                                        'A fazer'}
                                      </span>
                                      
                                      {task.priority && (
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskPriorityClass(task.priority)}`}>
                                          {task.priority === 'high' ? 'Alta' : 
                                          task.priority === 'medium' ? 'Média' : 
                                          'Baixa'}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <h3 className="font-medium text-base mb-1">{task.title}</h3>
                                    
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                                    )}
                                    
                                    <div className="text-xs text-muted-foreground font-medium">
                                      <i className="fas fa-calendar-day mr-1"></i>
                                      {formatDate(task.dueDate)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <i className="fas fa-calendar-day text-2xl text-primary"></i>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Nenhuma tarefa com prazo definido</h3>
                      <p className="text-muted-foreground mb-6">
                        Adicione tarefas com prazos para visualizar o cronograma do evento.
                      </p>
                      <Button onClick={() => navigate(`/events/${eventId}/tasks/new`)}>
                        <i className="fas fa-plus mr-2"></i> Adicionar Tarefa
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="activity">
                <div className="p-4 sm:p-6">
                  <h2 className="text-xl font-semibold mb-6">Atividades Recentes</h2>
                  <ActivityFeed
                    activities={activities}
                    loading={activitiesLoading}
                    limit={10}
                  />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
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
    default: return "bg-gray-500/10 text-gray-400";
  }
};

export default Event;