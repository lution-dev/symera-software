import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface EventProps {
  id?: string;
}

const Event: React.FC<EventProps> = ({ id }) => {
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
        body: { status: newStatus }
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
      
      
      
      {/* Event Cover Image - Ajustado para mobile */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 mb-4 sm:mb-6 rounded-xl overflow-hidden shadow-md">
        <img 
          src={event.coverImageUrl || getDefaultCover()}
          alt={`${event.name} - ${getEventTypeLabel(event.type)}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
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
      
      {/* Status Change Control foi movido para o card de informações */}
      
      {/* Alerta para tarefas pendentes quando evento está próximo */}
      {(event as any).warningMessage && (
        <div className="mb-6 p-4 bg-amber-950/30 border-l-4 border-amber-500 rounded-lg text-amber-100">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <p>{(event as any).warningMessage}</p>
          </div>
        </div>
      )}
      
      {/* Event Header - Design inspirado em aplicativos de alta qualidade */}
      <div className="bg-card rounded-xl mb-6 shadow-sm overflow-hidden">
        {/* Cabeçalho com status */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/40">
          <div className="flex items-center space-x-2">
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
            
            {/* Status Change Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                  <i className="fas fa-pencil-alt text-xs"></i>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Alterar status do evento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Selecione o novo status para o evento. Isso afetará como o evento é exibido em toda a plataforma.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Select
                    defaultValue={event.status}
                    onValueChange={(value) => {
                      updateEventStatusMutation.mutate(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="planning" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[hsl(var(--event-planning))]"></span>
                          <span>Planejamento</span>
                          <span className="text-xs text-muted-foreground ml-2">- Evento em construção</span>
                        </SelectItem>
                        <SelectItem value="confirmed" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[hsl(var(--event-confirmed))]"></span>
                          <span>Confirmado</span>
                          <span className="text-xs text-muted-foreground ml-2">- Planejamento completo</span>
                        </SelectItem>
                        <SelectItem value="in_progress" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[hsl(var(--event-in-progress))]"></span>
                          <span>Em andamento</span>
                          <span className="text-xs text-muted-foreground ml-2">- Evento ocorrendo agora</span>
                        </SelectItem>
                        <SelectItem value="active" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[hsl(var(--event-in-progress))]"></span>
                          <span>Ativo</span>
                          <span className="text-xs text-muted-foreground ml-2">- Status legado</span>
                        </SelectItem>
                        <SelectItem value="completed" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[hsl(var(--event-completed))]"></span>
                          <span>Concluído</span>
                          <span className="text-xs text-muted-foreground ml-2">- Evento finalizado</span>
                        </SelectItem>
                        <SelectItem value="cancelled" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[hsl(var(--event-cancelled))]"></span>
                          <span>Cancelado</span>
                          <span className="text-xs text-muted-foreground ml-2">- Evento não será realizado</span>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href={`/events/${eventId}/edit`}>
              <Button variant="outline" size="sm" className="h-9">
                <i className="fas fa-edit mr-2"></i> Editar
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDeleteEvent} size="sm" className="h-9">
              <i className="fas fa-trash-alt mr-2"></i> Excluir
            </Button>
          </div>
          
          {/* Mobile More Options - Fix for dropdown menu */}
          <div className="sm:hidden flex">
            <div className="flex gap-2">
              <Link href={`/events/${eventId}/edit`}>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                  <i className="fas fa-edit"></i>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 text-destructive rounded-full" 
                onClick={handleDeleteEvent}
              >
                <i className="fas fa-trash-alt"></i>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Info Grid com ações integradas */}
        <div className="p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-start">
            <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary">
              <i className="fas fa-calendar-day text-sm"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="mt-0.5 text-sm font-medium">{formatDate(event.date)}</p>
            </div>
          </div>
          
          {event.location && (
            <div className="flex items-start">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary">
                <i className="fas fa-map-marker-alt text-sm"></i>
              </div>
              <div className="ml-3">
                <p className="text-xs text-muted-foreground">Local</p>
                <p className="mt-0.5 text-sm font-medium">{event.location}</p>
              </div>
            </div>
          )}
          
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
          
          {event.budget && (
            <div className="flex items-start">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary">
                <i className="fas fa-coins text-sm"></i>
              </div>
              <div className="ml-3">
                <p className="text-xs text-muted-foreground">Orçamento</p>
                <p className="mt-0.5 text-sm font-medium">{formatCurrency(event.budget)}</p>
              </div>
            </div>
          )}
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
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage 
                      src={member.user.profileImageUrl} 
                      alt={`${member.user.firstName} ${member.user.lastName}`}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(`${member.user.firstName || ''} ${member.user.lastName || ''}`)}
                    </AvatarFallback>
                  </Avatar>
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
        <div className="overflow-x-auto pb-2 -mb-2">
          <TabsList className="mb-4 flex-nowrap w-auto min-w-max">
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="team">Equipe Completa</TabsTrigger>
            <TabsTrigger value="timeline">Cronograma do Evento</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Checklist do Evento</h2>
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/events/${eventId}/tasks/new`)} variant="default">
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
            <h2 className="text-xl font-semibold mb-6">Cronograma do Evento</h2>
            
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
                <p className="text-muted-foreground mb-6">Adicione tarefas com prazos para visualizar o cronograma do evento</p>
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
