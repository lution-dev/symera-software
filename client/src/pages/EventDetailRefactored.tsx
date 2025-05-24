import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TaskList from "@/components/Dashboard/TaskList";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { formatDate, formatCurrency, calculateTaskProgress, getEventTypeLabel, getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

const EventDetail: React.FC<EventProps> = ({ id }) => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Estado para a navegação lateral
  const [activeSection, setActiveSection] = useState<string>("resumo");
  
  // Filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Extrair o ID da URL se não recebido como prop
  const eventId = id || location.split('/')[2];
  
  // Configuração para garantir que dados recentes sejam carregados sempre
  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated,
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
  
  // Forçar recarga quando a página for montada
  useEffect(() => {
    if (eventId) {
      // Pequeno atraso para garantir que a atualização do banco foi concluída
      setTimeout(() => refetch(), 500);
    }
  }, [eventId, refetch]);
  
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
  
  // Função para calcular dias restantes até um evento
  const getRemainingDays = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Função para obter imagem de capa padrão com base no tipo de evento
  const getDefaultCover = () => {
    if (!event) return '';
    
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

  // Handle para quando o botão editar é clicado
  const handleEditClick = () => {
    navigate(`/events/${eventId}/edit`);
  };

  return (
    <div className="container mx-auto px-0 py-0 sm:py-4">
      {/* Header bar fixo com breadcrumb - mantido visível durante rolagem */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border w-full">
        <div className="container mx-auto">
          {/* Breadcrumb Navigation - visível em desktop e tablet */}
          <nav className="hidden sm:flex py-3 px-4" aria-label="Breadcrumb">
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
          
          {/* Breadcrumb para Mobile - simplificado como "Voltar" */}
          <div className="sm:hidden flex items-center py-3 px-4">
            <Link href="/events" className="flex items-center text-sm text-foreground font-medium">
              <i className="fas fa-arrow-left mr-2"></i>
              Voltar para Eventos
            </Link>
          </div>
        </div>
      </div>
      
      {/* Espaçamento para compensar o header fixo */}
      <div className="h-12 sm:h-14"></div>
      
      {/* Layout principal com sidebar lateral e conteúdo */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-150px)]">
        {/* Sidebar - Visível em desktop, escondida em mobile */}
        <div className="hidden md:block w-64 bg-card rounded-lg shadow-md border border-border sticky top-14 overflow-y-auto h-fit">
          <div className="py-4 px-4">
            {/* Menu lateral - apenas abas de navegação, sem título */}
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveSection('resumo')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'resumo' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="far fa-file mr-2"></i> Resumo
              </button>
              <button 
                onClick={() => setActiveSection('tarefas')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'tarefas' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="fas fa-tasks mr-2"></i> Tarefas
              </button>
              <button 
                onClick={() => setActiveSection('equipe')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'equipe' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="far fa-user-circle mr-2"></i> Equipe
              </button>
              <button 
                onClick={() => setActiveSection('participantes')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'participantes' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="far fa-address-book mr-2"></i> <span className="whitespace-nowrap">Lista de Participantes</span>
              </button>
              <button 
                onClick={() => setActiveSection('cronograma')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'cronograma' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="far fa-calendar-alt mr-2"></i> Cronograma
              </button>
              <button 
                onClick={() => setActiveSection('financeiro')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'financeiro' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="far fa-money-bill-alt mr-2"></i> Financeiro
              </button>
              <button 
                onClick={() => setActiveSection('documentos')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'documentos' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="far fa-file-pdf mr-2"></i> Documentos
              </button>
              <button 
                onClick={() => setActiveSection('atividades')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'atividades' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="fas fa-history mr-2"></i> Atividades
              </button>
              <button 
                onClick={() => setActiveSection('feedback')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'feedback' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="far fa-comment-alt mr-2"></i> Feedback pós-evento
              </button>
            </nav>
          </div>
        </div>
        
        {/* Menu dropdown para mobile */}
        <div className="md:hidden px-4 mb-4">
          <Select value={activeSection} onValueChange={(value) => {
            setActiveSection(value);
          }}>
            <SelectTrigger className="w-full" aria-label="Selecionar seção">
              <SelectValue placeholder="Selecionar seção" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Navegação do Evento</SelectLabel>
                <SelectItem value="resumo">
                  <div className="flex items-center">
                    <i className="fas fa-file-alt mr-2"></i> Resumo
                  </div>
                </SelectItem>
                <SelectItem value="tarefas">
                  <div className="flex items-center">
                    <i className="fas fa-tasks mr-2"></i> Tarefas
                  </div>
                </SelectItem>
                <SelectItem value="equipe">
                  <div className="flex items-center">
                    <i className="far fa-user-circle mr-2"></i> Equipe
                  </div>
                </SelectItem>
                <SelectItem value="participantes">
                  <div className="flex items-center">
                    <i className="far fa-address-book mr-2"></i> Lista de Participantes
                  </div>
                </SelectItem>
                <SelectItem value="cronograma">
                  <div className="flex items-center">
                    <i className="fas fa-calendar-alt mr-2"></i> Cronograma
                  </div>
                </SelectItem>
                <SelectItem value="financeiro">
                  <div className="flex items-center">
                    <i className="far fa-money-bill-alt mr-2"></i> Financeiro
                  </div>
                </SelectItem>
                <SelectItem value="documentos">
                  <div className="flex items-center">
                    <i className="fas fa-file-pdf mr-2"></i> Documentos
                  </div>
                </SelectItem>
                <SelectItem value="atividades">
                  <div className="flex items-center">
                    <i className="fas fa-history mr-2"></i> Atividades
                  </div>
                </SelectItem>
                <SelectItem value="feedback">
                  <div className="flex items-center">
                    <i className="fas fa-comment-alt mr-2"></i> Feedback pós-evento
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex-1 px-4 md:px-6 overflow-x-hidden">
          {/* Conteúdo baseado na seção ativa */}
          {activeSection === "resumo" && (
            <div className="space-y-6">
              {/* Cabeçalho principal do evento */}
              <div className="rounded-xl overflow-hidden shadow-md mb-6">
                {/* Imagem de capa com informações do evento sobrepostas */}
                <div className="relative h-48 sm:h-64 md:h-[220px]">
                  <img 
                    src={event.coverImageUrl || getDefaultCover()}
                    alt={`${event.name} - ${getEventTypeLabel(event.type)}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-background/70 sm:from-background/95 sm:to-background/30"></div>
                  
                  {/* Botão de editar no canto superior direito */}
                  <div className="absolute top-4 right-4 z-10">
                    <Button 
                      onClick={handleEditClick}
                      variant="secondary"
                      className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-sm"
                      size="sm"
                    >
                      <i className="fas fa-edit mr-2"></i> Editar Evento
                    </Button>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge className="px-2 py-1 text-xs" variant="outline">
                        {getEventTypeLabel(event.type)}
                      </Badge>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                
                {/* Informações principais do evento em formato de grade abaixo da imagem */}
                <div className="bg-card p-5 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Data e Horário */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center text-primary mr-3">
                        <i className="far fa-calendar-alt text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Data e Horário</p>
                        <p className="text-sm font-medium truncate">
                          {event.startDate ? (
                            event.endDate && event.endDate === event.startDate && event.startTime && event.endTime ? (
                              <span>
                                {formatDate(event.startDate)} {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
                              </span>
                            ) : (
                              <span>
                                {formatDate(event.startDate)}
                                {event.startTime && ` ${event.startTime.substring(0, 5)}`}
                                {event.endDate && event.endDate !== event.startDate && 
                                  ` até ${formatDate(event.endDate)}`}
                                {event.endTime && event.endDate !== event.startDate && 
                                  ` ${event.endTime.substring(0, 5)}`}
                              </span>
                            )
                          ) : (
                            "A definir"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Local do evento */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center text-primary mr-3">
                        <i className="fas fa-map-marker-alt text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Local</p>
                        <p className="text-sm font-medium truncate">
                          {event.location || "A definir"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Número de convidados */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center text-primary mr-3">
                        <i className="fas fa-users text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Convidados</p>
                        <p className="text-sm font-medium">{event.attendees || 0}</p>
                      </div>
                    </div>
                    
                    {/* Orçamento */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-10 h-10 flex items-center justify-center text-primary mr-3">
                        <i className="fas fa-money-bill-alt text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Orçamento</p>
                        <p className="text-sm font-medium">{event.budget ? formatCurrency(event.budget) : "R$ 0,00"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Barra de Progresso - Completamente fora do card principal */}
                <div className="bg-card mt-4 p-3 rounded-md border border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-9 h-9 flex items-center justify-center text-primary">
                      <i className="far fa-chart-bar text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground">Progresso</p>
                        <span className="text-xs font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-primary/10 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Indicadores estratégicos do evento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total de tarefas e progresso */}
                <div className="bg-card rounded-xl shadow-sm p-5 border border-border h-full">
                  <h3 className="text-sm font-medium mb-4 flex items-center">
                    <i className="fas fa-tasks text-primary mr-2"></i> Tarefas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-semibold">{totalTasks || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Concluídas:</span>
                      <span className="font-semibold text-[hsl(var(--event-completed))]">{completedTasks || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Em progresso:</span>
                      <span className="font-semibold text-[hsl(var(--event-in-progress))]">{inProgressTasks || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pendentes:</span>
                      <span className="font-semibold text-[hsl(var(--event-planning))]">{todoTasks || 0}</span>
                    </div>
                  </div>
                </div>
                
                {/* Orçamento e gastos */}
                <div className="bg-card rounded-xl shadow-sm p-5 border border-border h-full">
                  <h3 className="text-sm font-medium mb-4 flex items-center">
                    <i className="fas fa-coins text-primary mr-2"></i> Financeiro
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Orçamento total:</span>
                      <span className="font-semibold">{event.budget ? formatCurrency(event.budget) : "R$ 0,00"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gastos atuais:</span>
                      <span className="font-semibold">{event.expenses ? formatCurrency(event.expenses) : "R$ 0,00"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Saldo restante:</span>
                      <span className="font-semibold text-green-600">
                        {event.budget && event.expenses
                          ? formatCurrency(event.budget - event.expenses)
                          : event.budget
                            ? formatCurrency(event.budget)
                            : "R$ 0,00"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gasto atual:</span>
                      <span className="font-semibold">
                        {event.budget && event.expenses && event.budget > 0
                          ? `${Math.round((event.expenses / event.budget) * 100)}%` 
                          : "0%"
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Participantes */}
                <div className="bg-card rounded-xl shadow-sm p-5 border border-border h-full">
                  <h3 className="text-sm font-medium mb-4 flex items-center">
                    <i className="fas fa-users text-primary mr-2"></i> Participantes
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total convidados:</span>
                      <span className="font-semibold">{event.attendees || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confirmados:</span>
                      <span className="font-semibold text-[hsl(var(--event-confirmed))]">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Equipe do evento:</span>
                      <span className="font-semibold">{team?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fornecedores:</span>
                      <span className="font-semibold">0</span>
                    </div>
                  </div>
                </div>
                
                {/* Duração e datas */}
                <div className="bg-card rounded-xl shadow-sm p-5 border border-border h-full">
                  <h3 className="text-sm font-medium mb-4 flex items-center">
                    <i className="fas fa-clock text-primary mr-2"></i> Duração e prazos
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Data do evento:</span>
                      <span className="font-semibold">
                        {event.startDate ? formatDate(event.startDate) : "A definir"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Duração:</span>
                      <span className="font-semibold">
                        {event.startTime && event.endTime ? (
                          (() => {
                            const start = new Date(`2025-01-01T${event.startTime}`);
                            const end = new Date(`2025-01-01T${event.endTime}`);
                            const diffMs = end.getTime() - start.getTime();
                            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            return `${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}m` : ''}`;
                          })()
                        ) : "A definir"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Última atualização:</span>
                      <span className="font-semibold">
                        {formatDate(new Date())}
                      </span>
                    </div>
                    {event.startDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Dias restantes:</span>
                        <span className="font-semibold">
                          {(() => {
                            const eventDate = new Date(event.startDate);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            eventDate.setHours(0, 0, 0, 0);
                            const diffTime = eventDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays > 0 ? `${diffDays} dias` : "Hoje";
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Insight da IA */}
              <div className="bg-card rounded-xl shadow-sm p-5 border border-border mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-lightbulb text-primary"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-2">Insights do evento</h3>
                    <p className="text-sm text-muted-foreground">
                      {todoTasks > 0 ? (
                        <span>
                          Você tem {todoTasks} {todoTasks === 1 ? 'tarefa pendente' : 'tarefas pendentes'} para este evento
                          {event.startDate ? (
                            (() => {
                              const eventDate = new Date(event.startDate);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              eventDate.setHours(0, 0, 0, 0);
                              const diffTime = eventDate.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              return diffDays > 0 
                                ? ` e faltam ${diffDays} dias para o evento acontecer.` 
                                : `. O evento é hoje!`;
                            })()
                          ) : '.'}
                        </span>
                      ) : (
                        <span>
                          Todas as tarefas foram concluídas! 
                          {event.startDate ? (
                            (() => {
                              const eventDate = new Date(event.startDate);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              eventDate.setHours(0, 0, 0, 0);
                              const diffTime = eventDate.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              return diffDays > 0 
                                ? ` Faltam ${diffDays} dias para o evento acontecer.` 
                                : ` O evento é hoje!`;
                            })()
                          ) : ''}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === "tarefas" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h2 className="text-xl font-semibold">Checklist do Evento</h2>
                <div className="flex flex-wrap w-full sm:w-auto gap-2">
                  <Button onClick={() => navigate(`/events/${eventId}/tasks/new`)} variant="default" className="flex-1 sm:flex-auto">
                    <i className="fas fa-plus mr-2"></i> Nova Tarefa
                  </Button>
                </div>
              </div>
              
              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <TaskList 
                  tasks={tasks || []}
                  loading={false}
                  eventId={eventId}
                />
              )}
            </div>
          )}
          
          {activeSection === "equipe" && (
            <div className="bg-card rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Equipe do Evento</h2>
                <Button onClick={() => navigate(`/events/${eventId}/team/add`)} variant="default">
                  <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                </Button>
              </div>
              {teamLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : team && team.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.map((member: any) => (
                    <div key={member.id} className="bg-card border border-border rounded-lg p-4 flex items-start">
                      <Avatar className="h-10 w-10 mr-3">
                        {member.user?.profileImageUrl ? (
                          <AvatarImage src={member.user.profileImageUrl} alt={`${member.user.firstName} ${member.user.lastName}` || 'Membro da equipe'} />
                        ) : (
                          <AvatarFallback>{getInitials(`${member.user?.firstName} ${member.user?.lastName}`)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{member.user?.firstName} {member.user?.lastName}</h3>
                          <Badge variant="outline" className="ml-2 text-xs whitespace-nowrap">
                            {member.role === 'organizer' ? 'Organizador' : 
                             member.role === 'vendor' ? 'Fornecedor' : 
                             member.role === 'team_member' ? 'Membro da Equipe' : member.role}
                          </Badge>
                        </div>
                        {member.user?.email && (
                          <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
                        )}
                        {member.phone && (
                          <p className="text-sm text-muted-foreground truncate">{member.phone}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/40 rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                    <i className="fas fa-users text-muted-foreground text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Sem membros na equipe</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Este evento ainda não tem membros na equipe. Adicione colaboradores para distribuir tarefas.
                  </p>
                  <Button onClick={() => navigate(`/events/${eventId}/team/add`)} variant="default">
                    <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeSection === "atividades" && (
            <ActivityFeed
              activities={activities || []}
              loading={activitiesLoading}
              limit={10}
            />
          )}
          
          {/* Lista de Participantes */}
          {activeSection === "participantes" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold">Lista de Participantes</h2>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-auto">
                    <i className="fas fa-file-import mr-2"></i> Importar
                  </Button>
                  <Button variant="default" size="sm" className="flex-1 sm:flex-auto">
                    <i className="fas fa-plus mr-2"></i> Adicionar
                  </Button>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div className="w-full sm:w-72">
                    <Input
                      placeholder="Buscar participantes..."
                      className="h-9"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select defaultValue="todos">
                      <SelectTrigger className="w-full sm:w-[140px] h-9">
                        <SelectValue placeholder="Filtrar por..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="confirmados">Confirmados</SelectItem>
                        <SelectItem value="pendentes">Pendentes</SelectItem>
                        <SelectItem value="cancelados">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="text-center py-12 border border-dashed border-border rounded-lg mt-4">
                  <i className="fas fa-user-friends text-3xl text-muted-foreground/50 mb-3"></i>
                  <h3 className="font-medium text-lg mb-2">Nenhum participante cadastrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">Adicione participantes para gerenciar presenças no seu evento</p>
                  <Button variant="default">
                    <i className="fas fa-plus mr-2"></i> Adicionar Primeiro Participante
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cronograma */}
          {activeSection === "cronograma" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold">Cronograma do Evento</h2>
                <Button variant="default" className="w-full sm:w-auto">
                  <i className="fas fa-plus mr-2"></i> Adicionar Atividade
                </Button>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="border-l-2 border-primary/30 pl-4 space-y-8 relative py-4">
                  {/* Início do cronograma com data do evento */}
                  <div className="relative mb-2">
                    <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                    <div className="ml-5 bg-primary/10 p-3 rounded-lg border border-primary/20 mb-6">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-calendar-day text-primary"></i>
                        <span className="font-medium">
                          {event.startDate ? formatDate(event.startDate) : "Data do evento"}
                          {event.startTime && event.endTime && (
                            <span className="ml-1 text-primary/80">
                              {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <i className="fas fa-map-marker-alt text-primary text-sm"></i>
                        <span className="text-sm">
                          {event.name} - {event.location || "Local não definido"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <i className="fas fa-info-circle text-primary text-sm"></i>
                        <span className="text-xs text-muted-foreground">
                          Programação completa do evento com {event.attendees || 0} convidados esperados
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Atividades do cronograma - exibidas quando existirem */}
                  <div className="space-y-8">
                    {/* Atividade 1 */}
                    <div>
                      <div className="flex items-center">
                        <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium text-primary">09:00</span>
                      </div>
                      <div className="ml-5 bg-muted/30 p-3 rounded-lg border border-border mt-2">
                        <h4 className="font-medium">Recepção dos convidados</h4>
                        <p className="text-sm text-muted-foreground">Credenciamento e entrega de materiais promocionais</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">Saguão Principal</Badge>
                          <Badge variant="outline" className="text-xs">Equipe de Recepção</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Atividade 2 */}
                    <div>
                      <div className="flex items-center">
                        <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium text-primary">10:30</span>
                      </div>
                      <div className="ml-5 bg-muted/30 p-3 rounded-lg border border-border mt-2">
                        <h4 className="font-medium">Apresentação da coleção</h4>
                        <p className="text-sm text-muted-foreground">Discurso de abertura e apresentação das principais peças da coleção</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">Auditório</Badge>
                          <Badge variant="outline" className="text-xs">Diretor Criativo</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Atividade 3 */}
                    <div>
                      <div className="flex items-center">
                        <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium text-primary">12:30</span>
                      </div>
                      <div className="ml-5 bg-muted/30 p-3 rounded-lg border border-border mt-2">
                        <h4 className="font-medium">Almoço de networking</h4>
                        <p className="text-sm text-muted-foreground">Buffet completo e networking entre convidados</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">Salão de Festas</Badge>
                          <Badge variant="outline" className="text-xs">Todos os convidados</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Atividade 4 */}
                    <div>
                      <div className="flex items-center">
                        <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium text-primary">14:30</span>
                      </div>
                      <div className="ml-5 bg-muted/30 p-3 rounded-lg border border-border mt-2">
                        <h4 className="font-medium">Desfile com modelos</h4>
                        <p className="text-sm text-muted-foreground">Apresentação das peças em passarela com modelos profissionais</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">Área de Exposição</Badge>
                          <Badge variant="outline" className="text-xs">Equipe de Produção</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Atividade 5 */}
                    <div>
                      <div className="flex items-center">
                        <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium text-primary">16:30</span>
                      </div>
                      <div className="ml-5 bg-muted/30 p-3 rounded-lg border border-border mt-2">
                        <h4 className="font-medium">Coquetel de encerramento</h4>
                        <p className="text-sm text-muted-foreground">Drinks, canapés e networking para finalizar o evento</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">Terraço</Badge>
                          <Badge variant="outline" className="text-xs">Todos os convidados</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute left-[-8px] bottom-0 w-4 h-4 rounded-full bg-primary/30"></div>
                </div>
                
                {/* Botão para adicionar novas atividades ao cronograma */}
                <div className="flex justify-center mt-6">
                  <Button variant="default">
                    <i className="fas fa-plus mr-2"></i> Adicionar Nova Atividade
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Financeiro */}
          {activeSection === "financeiro" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold">Financeiro</h2>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-auto">
                    <i className="fas fa-file-export mr-2"></i> Exportar
                  </Button>
                  <Button variant="default" className="flex-1 sm:flex-auto">
                    <i className="fas fa-plus mr-2"></i> Registrar Gasto
                  </Button>
                </div>
              </div>
              
              {/* Cards de resumo financeiro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Orçamento Total</p>
                  <p className="text-2xl font-bold mb-0">R$ {formatCurrency(event.budget || 0)}</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Gastos Atuais</p>
                  <p className="text-2xl font-bold mb-0">R$ {formatCurrency(event.expenses || 0)}</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                  <p className="text-2xl font-bold mb-0 text-green-500">
                    R$ {formatCurrency((event.budget || 0) - (event.expenses || 0))}
                  </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Custo por Convidado</p>
                  <p className="text-2xl font-bold mb-0">
                    R$ {event.attendees ? formatCurrency((event.budget || 0) / event.attendees) : '0,00'}
                  </p>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-medium mb-4">Categorias de Gastos</h3>
                
                <div className="text-center py-8">
                  <i className="fas fa-coins text-3xl text-muted-foreground/50 mb-3"></i>
                  <h3 className="font-medium text-lg mb-2">Sem gastos registrados</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Registre gastos para começar a controlar o orçamento do seu evento
                  </p>
                  <Button variant="default">
                    <i className="fas fa-plus mr-2"></i> Registrar Primeiro Gasto
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Documentos */}
          {activeSection === "documentos" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold">Documentos</h2>
                <Button variant="default" className="w-full sm:w-auto">
                  <i className="fas fa-upload mr-2"></i> Fazer Upload
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="font-medium mb-1">Contratos</p>
                  <p className="text-sm text-muted-foreground">0 documentos</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="font-medium mb-1">Orçamentos</p>
                  <p className="text-sm text-muted-foreground">0 documentos</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <p className="font-medium mb-1">Outros</p>
                  <p className="text-sm text-muted-foreground">0 documentos</p>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="text-center py-12">
                  <i className="fas fa-file-alt text-3xl text-muted-foreground/50 mb-3"></i>
                  <h3 className="font-medium text-lg mb-2">Nenhum documento disponível</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload de contratos, orçamentos e outros documentos relacionados ao evento
                  </p>
                  <Button variant="default">
                    <i className="fas fa-upload mr-2"></i> Fazer Upload do Primeiro Documento
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Feedback pós-evento */}
          {activeSection === "feedback" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold">Feedback pós-evento</h2>
                <Button variant="default" className="w-full sm:w-auto">
                  <i className="fas fa-paper-plane mr-2"></i> Enviar Pesquisa
                </Button>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Resumo de Feedbacks</h3>
                  <p className="text-sm text-muted-foreground">Colete feedbacks sobre o evento após sua realização</p>
                </div>
                
                <div className="text-center py-8">
                  <i className="fas fa-comment-alt text-3xl text-muted-foreground/50 mb-3"></i>
                  <h3 className="font-medium text-lg mb-2">Nenhum feedback recebido</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {event.startDate && getRemainingDays(event.startDate) > 0 ? 
                      `O evento acontecerá em ${getRemainingDays(event.startDate)} dias. Os feedbacks serão coletados após o evento.` : 
                      'Envie um formulário de feedback para os participantes avaliarem o evento.'
                    }
                  </p>
                  {event.startDate && getRemainingDays(event.startDate) <= 0 && (
                    <Button variant="default">
                      <i className="fas fa-paper-plane mr-2"></i> Enviar Pesquisa de Feedback
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;