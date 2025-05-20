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
      
      
      
      {/* Layout de dois cards lado a lado (1:1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 sm:mb-6">
        {/* Card da esquerda - Mantém o design atual mas encapsulado como um card lateral */}
        <div className="relative rounded-xl overflow-hidden shadow-md h-48 sm:h-64 md:h-72">
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
        <div className="bg-card rounded-xl shadow-md p-5 flex flex-col">
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
          
          <div className="space-y-4">
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
            
            {/* Local do evento */}
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
            
            {/* Orçamento */}
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
          
          {/* Status no fundo do card */}
          <div className="mt-auto pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Status</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                    <i className="fas fa-pencil-alt text-xs mr-1.5"></i> Alterar Status
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
                          <SelectItem value="planning">🔵 Planejamento</SelectItem>
                          <SelectItem value="confirmed">🟢 Confirmado</SelectItem>
                          <SelectItem value="in_progress">🟠 Em andamento</SelectItem>
                          <SelectItem value="completed">✅ Concluído</SelectItem>
                          <SelectItem value="cancelled">🔴 Cancelado</SelectItem>
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
            
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerta para tarefas pendentes quando evento está próximo */}
      
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <i className="fas fa-ellipsis-h"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRegenerateChecklist}>
                  <i className="fas fa-sync-alt mr-2"></i> Regenerar Checklist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteEvent} className="text-destructive">
                  <i className="fas fa-trash-alt mr-2"></i> Excluir Evento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile More Options */}
          <div className="sm:hidden flex">
            <div className="flex gap-2">
              <Link href={`/events/${eventId}/edit`}>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                  <i className="fas fa-edit"></i>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                    <i className="fas fa-ellipsis-v"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleRegenerateChecklist}>
                    <i className="fas fa-sync-alt mr-2"></i> Regenerar Checklist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteEvent} className="text-destructive">
                    <i className="fas fa-trash-alt mr-2"></i> Excluir Evento
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      
      {/* Painel de Gestão Estratégica do Evento */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
        
        {/* Card de Progresso & Etapas */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border-t-4 border-primary/70 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mr-2 sm:mr-3">
              <i className="fas fa-tasks text-primary text-sm sm:text-base"></i>
            </div>
            <h3 className="font-semibold text-base sm:text-lg">Progresso do Projeto</h3>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="text-xs sm:text-sm font-medium">{progress}% completo</span>
            </div>
            <span className="text-primary font-medium text-xs sm:text-sm">{completedTasks}/{totalTasks} tarefas</span>
          </div>
          
          <div className="w-full h-2 bg-muted rounded-full mb-4 sm:mb-5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 text-center mb-4">
            <div className="bg-muted/50 hover:bg-muted rounded-md p-1.5 sm:p-2 md:p-3 transition-colors">
              <div className={`text-base sm:text-lg font-bold ${todoTasks > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{todoTasks}</div>
              <div className="text-[0.65rem] sm:text-xs font-medium truncate">Pendentes</div>
            </div>
            <div className="bg-muted/50 hover:bg-muted rounded-md p-1.5 sm:p-2 md:p-3 transition-colors">
              <div className={`text-base sm:text-lg font-bold ${inProgressTasks > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>{inProgressTasks}</div>
              <div className="text-[0.65rem] sm:text-xs font-medium truncate">Em progr.</div>
            </div>
            <div className="bg-muted/50 hover:bg-muted rounded-md p-1.5 sm:p-2 md:p-3 transition-colors">
              <div className={`text-base sm:text-lg font-bold ${completedTasks > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>{completedTasks}</div>
              <div className="text-[0.65rem] sm:text-xs font-medium truncate">Concluídas</div>
            </div>
          </div>
          
          <div className="mt-auto pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm" onClick={() => navigate(`/events/${eventId}/tasks`)}>
              <i className="fas fa-chart-line mr-1 sm:mr-2"></i> Análise Detalhada
            </Button>
          </div>
        </div>
        
        {/* Card de Orçamento & Financeiro */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border-t-4 border-blue-500/70 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-2 sm:mr-3">
              <i className="fas fa-wallet text-blue-500 text-sm sm:text-base"></i>
            </div>
            <h3 className="font-semibold text-base sm:text-lg">Gestão Financeira</h3>
          </div>
          
          {event.budget ? (
            <>
              <div className="space-y-4 sm:space-y-6 mb-4">
                {/* Valores principais com formatação abreviada para valores grandes */}
                <div className="flex justify-between items-center flex-wrap gap-y-3 sm:gap-y-4">
                  <div className="min-w-[100px] sm:min-w-[110px]">
                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Orçamento</div>
                    <div className="text-base sm:text-xl font-bold">
                      {event.budget >= 10000 
                        ? `R$ ${(event.budget / 1000).toFixed(0)}${event.budget >= 1000000 ? 'M' : 'K'}`
                        : formatCurrency(event.budget)
                      }
                    </div>
                  </div>
                  <div className="min-w-[100px] sm:min-w-[110px] text-right">
                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Gasto atual</div>
                    <div className="text-base sm:text-xl font-bold">
                      {(event.expenses || 0) >= 10000 
                        ? `R$ ${((event.expenses || 0) / 1000).toFixed(0)}${(event.expenses || 0) >= 1000000 ? 'M' : 'K'}`
                        : formatCurrency(event.expenses || 0)
                      }
                    </div>
                  </div>
                </div>
                
                {/* Barra de progresso e status */}
                <div>
                  <div className="flex flex-wrap justify-between mb-2 text-xs sm:text-sm gap-2">
                    <span className={`font-medium whitespace-nowrap ${(event.expenses || 0) / event.budget > 0.8 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {Math.round((event.expenses || 0) / event.budget * 100)}% utilizado
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      {(event.budget - (event.expenses || 0)) >= 10000 
                        ? `R$ ${((event.budget - (event.expenses || 0)) / 1000).toFixed(0)}${(event.budget - (event.expenses || 0)) >= 1000000 ? 'M' : 'K'} disponível`
                        : `${formatCurrency(event.budget - (event.expenses || 0))} disponível`
                      }
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        (event.expenses || 0) / event.budget > 0.9 ? 'bg-red-500' : 
                        (event.expenses || 0) / event.budget > 0.7 ? 'bg-amber-500' : 
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((event.expenses || 0) / event.budget * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm" onClick={() => navigate(`/events/${eventId}/budget`)}>
                  <i className="fas fa-chart-pie mr-1 sm:mr-2"></i> Análise de Gastos
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 sm:py-6 flex flex-col items-center flex-grow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <i className="fas fa-money-bill-wave text-muted-foreground text-base sm:text-xl"></i>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-4">Nenhum orçamento definido</p>
              <Button variant="outline" size="sm" className="mt-auto text-xs sm:text-sm">
                <i className="fas fa-plus mr-1 sm:mr-2"></i> Adicionar Orçamento
              </Button>
            </div>
          )}
        </div>
        
        {/* Card de Cronograma & Prazos */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border-t-4 border-purple-500/70 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-2 sm:mr-3">
              <i className="fas fa-calendar-alt text-purple-500 text-sm sm:text-base"></i>
            </div>
            <h3 className="font-semibold text-base sm:text-lg">Cronograma</h3>
          </div>
          
          {event.date ? (() => {
            const eventDate = new Date(event.date);
            const today = new Date();
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              // Evento já realizado
              return (
                <div className="flex flex-col items-center justify-center flex-grow text-center py-3 sm:py-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 sm:mb-3">
                    <i className="fas fa-flag-checkered text-blue-500 text-base sm:text-xl"></i>
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-blue-500 mb-1">Evento Realizado</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">em {formatDate(event.date)}</p>
                  <Button variant="outline" size="sm" className="mt-3 sm:mt-4 text-xs sm:text-sm">
                    <i className="fas fa-clipboard-check mr-1 sm:mr-2"></i> Gerar Relatório
                  </Button>
                </div>
              );
            } else if (diffDays === 0) {
              // Evento é hoje
              return (
                <div className="flex flex-col items-center justify-center flex-grow text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-2 sm:mb-3 animate-pulse">
                    <i className="fas fa-calendar-day text-green-500 text-2xl sm:text-3xl"></i>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-green-500 mb-1">HOJE!</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{formatDate(event.date)}</p>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-2">
                    <div className="bg-muted/50 p-1.5 sm:p-2 rounded-md text-center">
                      <div className="text-[0.65rem] sm:text-xs text-muted-foreground">Pendentes</div>
                      <div className="text-base sm:text-lg font-bold text-red-500">{todoTasks}</div>
                    </div>
                    <div className="bg-muted/50 p-1.5 sm:p-2 rounded-md text-center">
                      <div className="text-[0.65rem] sm:text-xs text-muted-foreground">Prontos</div>
                      <div className="text-base sm:text-lg font-bold text-green-500">{completedTasks}</div>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Evento futuro
              const urgency = diffDays <= 7 ? 'text-amber-500' : (diffDays <= 30 ? 'text-blue-500' : 'text-purple-500');
              
              return (
                <div className="flex flex-col items-center flex-grow">
                  <div className="text-center mb-3 sm:mb-4">
                    <span className={`text-4xl sm:text-5xl font-bold block ${urgency}`}>
                      {diffDays}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {diffDays === 1 ? "dia restante" : "dias restantes"}
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i className="fas fa-calendar-week text-muted-foreground mr-1 sm:mr-2"></i>
                        <span className="text-xs sm:text-sm font-medium">{formatDate(event.date)}</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${diffDays <= 7 ? 'border-amber-500 text-amber-500' : ''}`}>
                        {diffDays <= 7 ? 'Próximo' : 'Planejado'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="w-full mt-auto">
                    <div className="mb-1 sm:mb-2 text-xs sm:text-sm font-medium">Progresso da preparação</div>
                    <div className="flex items-center justify-between text-[0.65rem] sm:text-xs text-muted-foreground mb-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                      <div 
                        className={`h-full rounded-full ${
                          progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            }
          })() : (
            <div className="text-center py-4 sm:py-6 flex flex-col items-center flex-grow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-2 sm:mb-3">
                <i className="fas fa-calendar-plus text-muted-foreground text-base sm:text-xl"></i>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">Data do evento não definida</p>
              <Button variant="outline" size="sm" className="mt-auto text-xs sm:text-sm">
                <i className="fas fa-calendar-plus mr-1 sm:mr-2"></i> Definir Data
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
