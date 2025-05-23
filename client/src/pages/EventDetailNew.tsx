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
        body: { status: newStatus }
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
  
  // Função para ordenar tarefas por prioridade
  const orderByPriority = (tasks: any[], descending: boolean = true) => {
    const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
    
    // Fazemos uma cópia profunda para evitar modificar o array original
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 0;
      const priorityB = priorityOrder[b.priority] || 0;
      
      if (descending) {
        return priorityB - priorityA;
      } else {
        return priorityA - priorityB;
      }
    });
    
    return sortedTasks;
  };

  // Função para ordenar tarefas por data
  const orderByDate = (tasks: any[], ascending: boolean = true) => {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return ascending ? 1 : -1;
      if (!b.dueDate) return ascending ? -1 : 1;
      
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  };

  // Função para ordenar tarefas por status
  const orderByStatus = (tasks: any[], ascending: boolean = true) => {
    const statusOrder: { [key: string]: number } = { todo: 1, in_progress: 2, completed: 3 };
    
    return [...tasks].sort((a, b) => {
      const statusA = statusOrder[a.status] || 0;
      const statusB = statusOrder[b.status] || 0;
      return ascending ? statusA - statusB : statusB - statusA;
    });
  };
    
  // Function to filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    // Deep clone tasks array to avoid reference issues
    let filteredTasks = JSON.parse(JSON.stringify(tasks));
    
    // Apply status filter
    if (statusFilter !== "all") {
      filteredTasks = filteredTasks.filter((task: any) => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== "all") {
      filteredTasks = filteredTasks.filter((task: any) => task.priority === priorityFilter);
    }
    
    // Apply assignee filter
    if (assigneeFilter === "mine") {
      filteredTasks = filteredTasks.filter((task: any) => 
        task.assigneeId === "8650891" || 
        task.assignees?.some((a: any) => a.userId === "8650891")
      );
    }
    
    // Apply date filter
    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filteredTasks = filteredTasks.filter((task: any) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    } else if (dateFilter === "week") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      filteredTasks = filteredTasks.filter((task: any) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= today && taskDate <= nextWeek;
      });
    } else if (dateFilter === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filteredTasks = filteredTasks.filter((task: any) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < today && task.status !== "completed";
      });
    }
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filteredTasks = filteredTasks.filter((task: any) => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // Aplicar ordenação conforme seleção
    if (sortBy === "priority") {
      return orderByPriority(filteredTasks, sortOrder === "desc");
    } else if (sortBy === "dueDate") {
      return orderByDate(filteredTasks, sortOrder === "asc");
    } else if (sortBy === "status") {
      return orderByStatus(filteredTasks, sortOrder === "asc");
    }
    
    return filteredTasks;
  };
    
  // Get filtered and sorted tasks
  const filteredAndSortedTasks = getFilteredAndSortedTasks();
  
  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setDateFilter("all");
    setSortBy("dueDate");
    setSortOrder("asc");
    setSearchQuery("");
  };

  // Função para obter imagem de capa padrão com base no tipo de evento
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
    <div className="container mx-auto px-0 sm:px-4 py-4 sm:py-6 mobile-spacing">
      {/* Breadcrumb Navigation - visível em desktop e tablet, mas oculto em mobile */}
      <nav className="hidden sm:flex mb-4 px-4" aria-label="Breadcrumb">
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
      
      {/* Layout principal com sidebar lateral e conteúdo */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-150px)]">
        {/* Sidebar - Visível em desktop, escondida em mobile */}
        <div className="hidden md:block w-64 bg-card border-r border-border h-[calc(100vh-130px)] sticky top-20 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 truncate">{event.name}</h2>
            
            {/* Menu lateral */}
            <nav className="space-y-1">
              <button 
                onClick={() => navigate(`/events/${eventId}/edit`)} 
                className="w-full flex items-center px-3 py-2 rounded-md hover:bg-muted text-foreground"
              >
                <i className="fas fa-edit mr-2"></i> Editar
              </button>
              <button 
                onClick={() => setActiveSection('resumo')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'resumo' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="fas fa-file-alt mr-2"></i> Resumo
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
                <i className="fas fa-users mr-2"></i> Equipe
              </button>
              <button 
                onClick={() => setActiveSection('participantes')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'participantes' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="fas fa-user-friends mr-2"></i> Lista de Participantes
              </button>
              <button 
                onClick={() => setActiveSection('cronograma')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'cronograma' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="fas fa-calendar-alt mr-2"></i> Cronograma
              </button>
              <button 
                onClick={() => setActiveSection('financeiro')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'financeiro' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="fas fa-coins mr-2"></i> Financeiro
              </button>
              <button 
                onClick={() => setActiveSection('documentos')} 
                className={`w-full flex items-center px-3 py-2 rounded-md ${
                  activeSection === 'documentos' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <i className="fas fa-file-pdf mr-2"></i> Documentos
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
                <i className="fas fa-comment-alt mr-2"></i> Feedback pós-evento
              </button>
            </nav>
          </div>
        </div>
        
        {/* Menu dropdown para mobile */}
        <div className="md:hidden px-4 mb-4">
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="w-full" aria-label="Selecionar seção">
              <SelectValue placeholder="Selecionar seção" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Navegação do Evento</SelectLabel>
                <SelectItem value="editar">
                  <div className="flex items-center">
                    <i className="fas fa-edit mr-2"></i> Editar
                  </div>
                </SelectItem>
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
                    <i className="fas fa-users mr-2"></i> Equipe
                  </div>
                </SelectItem>
                <SelectItem value="participantes">
                  <div className="flex items-center">
                    <i className="fas fa-user-friends mr-2"></i> Lista de Participantes
                  </div>
                </SelectItem>
                <SelectItem value="cronograma">
                  <div className="flex items-center">
                    <i className="fas fa-calendar-alt mr-2"></i> Cronograma
                  </div>
                </SelectItem>
                <SelectItem value="financeiro">
                  <div className="flex items-center">
                    <i className="fas fa-coins mr-2"></i> Financeiro
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
                
                {/* Card da direita - Informações do evento em formato de lista */}
                <div className="bg-card rounded-xl shadow-md p-5 flex flex-col min-h-[220px]">
                  <div className="flex justify-between items-start mb-4">
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    {/* Período do evento */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary mr-3">
                        <i className="fas fa-calendar-alt text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data</p>
                        <p className="text-sm font-medium">
                          {event.startDate && formatDate(event.startDate, { dateStyle: "long" })}
                          {event.endDate && event.startDate !== event.endDate && ` - ${formatDate(event.endDate, { dateStyle: "long" })}`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Horário do evento */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary mr-3">
                        <i className="fas fa-clock text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Horário</p>
                        <p className="text-sm font-medium">
                          {event.startTime && formatDate(
                            new Date(`2025-01-01T${event.startTime}`), 
                            { timeStyle: "short" }
                          )}
                          {event.endTime && event.startTime && ` - ${formatDate(
                            new Date(`2025-01-01T${event.endTime}`), 
                            { timeStyle: "short" }
                          )}`}
                        </p>
                      </div>
                    </div>

                    {/* Local do evento - sempre mostrar se disponível */}
                    {event.location && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary mr-3">
                          <i className="fas fa-map-marker-alt text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Local</p>
                          <p className="text-sm font-medium truncate max-w-[180px]">{event.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Link da reunião - sempre mostrar se disponível */}
                    {event.meetingUrl && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary mr-3">
                          <i className="fas fa-link text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Link da reunião</p>
                          <a 
                            href={event.meetingUrl.startsWith('http') ? event.meetingUrl : `https://${event.meetingUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline truncate inline-block max-w-[180px]"
                          >
                            {event.meetingUrl}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Número de convidados */}
                    {event.attendees && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary mr-3">
                          <i className="fas fa-user-friends text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Convidados</p>
                          <p className="text-sm font-medium">{event.attendees}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Orçamento */}
                    {event.budget && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary mr-3">
                          <i className="fas fa-coins text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Orçamento</p>
                          <p className="text-sm font-medium">{formatCurrency(event.budget)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Status simplificado */}
                  <div className="flex items-center justify-between border-t border-border mt-auto pt-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary mr-3">
                        <i className="fas fa-tasks text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Progresso</p>
                        <div className="w-32 sm:w-40 bg-primary/10 rounded-full h-2 mt-1">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{`${progress}% concluído`}</p>
                  </div>
                </div>
              </div>
              
              {/* Estatísticas do evento - Desktop e Tablet */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8 hidden sm:grid">
                {/* Total de tarefas */}
                <div className="bg-card rounded-lg shadow-sm p-4 flex items-center justify-between border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total de tarefas</p>
                    <p className="text-2xl font-semibold">{totalTasks || 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i className="fas fa-tasks"></i>
                  </div>
                </div>
                
                {/* Tarefas concluídas */}
                <div className="bg-card rounded-lg shadow-sm p-4 flex items-center justify-between border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Concluídas</p>
                    <p className="text-2xl font-semibold">{completedTasks || 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--event-completed))]/10 flex items-center justify-center text-[hsl(var(--event-completed))]">
                    <i className="fas fa-check"></i>
                  </div>
                </div>
                
                {/* Restante das estatísticas... */}
                {/* Você pode adicionar os outros cards de estatísticas aqui */}
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
              <TaskList 
                tasks={filteredAndSortedTasks}
                loading={tasksLoading}
                eventId={eventId}
              />
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
                        {member.profileImageUrl ? (
                          <AvatarImage src={member.profileImageUrl} alt={member.fullName || 'Membro da equipe'} />
                        ) : (
                          <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{member.fullName}</h3>
                          <Badge variant="outline" className="ml-2 text-xs whitespace-nowrap">
                            {member.role || 'Membro'}
                          </Badge>
                        </div>
                        {member.email && (
                          <p className="text-sm text-muted-foreground truncate">{member.email}</p>
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
              activities={activities}
              loading={activitiesLoading}
              limit={10}
            />
          )}
          
          {/* Placeholder para seções em desenvolvimento */}
          {(activeSection === "participantes" || 
            activeSection === "cronograma" || 
            activeSection === "financeiro" || 
            activeSection === "documentos" ||
            activeSection === "feedback") && (
            <div className="bg-card rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                <i className="fas fa-tools text-muted-foreground text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Em desenvolvimento</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Esta funcionalidade está sendo implementada e estará disponível em breve.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;