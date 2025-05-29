import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link, useRouter } from "wouter";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, UserPlus, X, Users, Search } from "lucide-react";

interface EventProps {
  id?: string;
}

const Event: React.FC<EventProps> = ({ id }) => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Team member selection modal state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  
  // Extrair o ID da URL se não recebido como prop
  const eventId = id || location.split('/')[2];
  
  // Hook para navegação
  const [, navigate] = useLocation();
  
  console.log("[Debug] ID do evento recebido como prop:", id);
  console.log("[Debug] ID do evento extraído da URL:", eventId);
  
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
      console.log("[Debug] Forçando recarga dos dados do evento:", eventId);
      // Pequeno atraso para garantir que a atualização do banco foi concluída
      setTimeout(() => refetch(), 500);
    }
  }, [eventId, refetch]);
  
  // Log dos dados do evento quando recebidos - SEM MODIFICAÇÕES
  useEffect(() => {
    if (event) {
      console.log("[Debug] Dados do evento exatamente como vieram do banco:", event);
      console.log("[Debug] Formato do evento (original):", event.format);
    }
  }, [event]);
  
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

  // Buscar todos os usuários disponíveis para adicionar à equipe
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: isAddMemberModalOpen,
    retry: 1,
    staleTime: 0,
  });

  // Filtrar usuários disponíveis (que não estão na equipe já)
  const filteredUsers = allUsers?.filter((user: any) => {
    const isNotInTeam = !team?.some((member: any) => member.user.id === user.id);
    const matchesSearch = memberSearchQuery === "" || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(memberSearchQuery.toLowerCase());
    return isNotInTeam && matchesSearch;
  }) || [];
  
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
  
  // Mutations para gerenciamento da equipe
  const addTeamMembersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      return apiRequest(`/api/events/${eventId}/team`, {
        method: "POST",
        body: JSON.stringify({ userIds }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Membros adicionados",
        description: `${selectedMembers.length} membro(s) adicionado(s) à equipe com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
      setIsAddMemberModalOpen(false);
      setSelectedMembers([]);
      setMemberSearchQuery("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os membros à equipe.",
        variant: "destructive",
      });
    },
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/events/${eventId}/team/${userId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Membro removido",
        description: "Membro removido da equipe com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da equipe.",
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
  
// Função direta para ordenar tarefas por prioridade
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

// Função direta para ordenar tarefas por data
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

// Função direta para ordenar tarefas por status
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
  
  // Apply assignee filter (user ID 8650891 is the current user)
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

  // Estado para a navegação via tabs
  const [activeTab, setActiveTab] = useState("resumo");
  
  // Função para navegação entre abas
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
                <i className="fas fa-calendar-day text-sm"></i>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quando</p>
                <p className="text-sm font-medium">
                  {event.startDate && event.endDate ? (
                    event.startDate === event.endDate ? (
                      <>
                        {new Date(event.startDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} 
                        {event.startTime && event.endTime && (
                          <>às {event.startTime.substring(0, 5)}{event.startTime !== event.endTime ? ` ➝ ${event.endTime.substring(0, 5)}` : ''}</>
                        )}
                      </>
                    ) : (
                      <>
                        {new Date(event.startDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} 
                        {event.startTime && <>às {event.startTime.substring(0, 5)}</>} 
                        <> ➝ {new Date(event.endDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</>
                        {event.endTime && <> às {event.endTime.substring(0, 5)}</>}
                      </>
                    )
                  ) : (
                    formatDate(event.date)
                  )}
                </p>
              </div>
            </div>
            
            {/* Formato do evento */}
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 w-8 h-8 flex items-center justify-center text-primary mr-3">
                <i className="fas fa-video text-sm"></i>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Formato</p>
                <p className="text-sm font-medium">
                  {/* Exibir exatamente o formato recebido do banco de dados com tradução */}
                  {event.format === 'in_person' ? 'Presencial' : 
                   event.format === 'online' ? 'Online' : 
                   event.format === 'hybrid' ? 'Híbrido' : 
                   event.format || 'Não definido'}
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
          <div className="flex items-center justify-between border-t border-border/30 pt-2 mt-auto">
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
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 px-0 rounded-full">
                  <i className="fas fa-pencil-alt text-xs"></i>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Alterar status do evento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Selecione o novo status para o evento.
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
          
          <div className="bg-card rounded-lg mb-4 overflow-hidden border border-border/10">
            {/* Barra de pesquisa e filtros minimalista */}
            <div className="p-3">
              <div className="flex gap-2">
                {/* Campo de pesquisa */}
                <div className="relative flex-1">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"></i>
                  <Input
                    placeholder="Pesquisar tarefas..."
                    className="pl-8 text-sm h-9 bg-muted/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Botão de filtro único */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant={(statusFilter !== "all" || priorityFilter !== "all" || dateFilter !== "all" || assigneeFilter !== "all") ? "default" : "outline"} 
                      size="sm" 
                      className="h-9 px-3 min-w-[42px] sm:min-w-[120px]"
                    >
                      <i className="fas fa-filter text-sm sm:mr-2"></i>
                      <span className="hidden sm:inline">Filtrar por</span>
                      {(statusFilter !== "all" || priorityFilter !== "all" || dateFilter !== "all" || assigneeFilter !== "all") && 
                        <span className="ml-1 bg-primary-foreground/20 rounded-full h-2 w-2 inline-block"></span>
                      }
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72">
                    <DropdownMenuLabel>Filtrar tarefas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <div className="p-2">
                      <h4 className="text-xs font-medium mb-1.5">Status</h4>
                      <RadioGroup value={statusFilter} onValueChange={setStatusFilter} className="flex flex-wrap gap-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="status-all" className="h-3.5 w-3.5" />
                          <Label htmlFor="status-all" className="text-xs">Todos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="todo" id="status-todo" className="h-3.5 w-3.5" />
                          <Label htmlFor="status-todo" className="text-xs">A fazer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in_progress" id="status-progress" className="h-3.5 w-3.5" />
                          <Label htmlFor="status-progress" className="text-xs">Em andamento</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="completed" id="status-done" className="h-3.5 w-3.5" />
                          <Label htmlFor="status-done" className="text-xs">Concluídas</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="p-2">
                      <h4 className="text-xs font-medium mb-1.5">Prioridade</h4>
                      <RadioGroup value={priorityFilter} onValueChange={setPriorityFilter} className="flex flex-wrap gap-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="priority-all" className="h-3.5 w-3.5" />
                          <Label htmlFor="priority-all" className="text-xs">Todas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="priority-high" className="h-3.5 w-3.5" />
                          <Label htmlFor="priority-high" className="text-xs">Alta</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="priority-medium" className="h-3.5 w-3.5" />
                          <Label htmlFor="priority-medium" className="text-xs">Média</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="priority-low" className="h-3.5 w-3.5" />
                          <Label htmlFor="priority-low" className="text-xs">Baixa</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="p-2">
                      <h4 className="text-xs font-medium mb-1.5">Data</h4>
                      <RadioGroup value={dateFilter} onValueChange={setDateFilter} className="flex flex-wrap gap-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="date-all" className="h-3.5 w-3.5" />
                          <Label htmlFor="date-all" className="text-xs">Todas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="today" id="date-today" className="h-3.5 w-3.5" />
                          <Label htmlFor="date-today" className="text-xs">Hoje</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="week" id="date-week" className="h-3.5 w-3.5" />
                          <Label htmlFor="date-week" className="text-xs">Esta semana</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="overdue" id="date-overdue" className="h-3.5 w-3.5" />
                          <Label htmlFor="date-overdue" className="text-xs">Atrasadas</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="p-2">
                      <h4 className="text-xs font-medium mb-1.5">Responsável</h4>
                      <RadioGroup value={assigneeFilter} onValueChange={setAssigneeFilter} className="flex gap-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="assignee-all" className="h-3.5 w-3.5" />
                          <Label htmlFor="assignee-all" className="text-xs">Todos</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mine" id="assignee-mine" className="h-3.5 w-3.5" />
                          <Label htmlFor="assignee-mine" className="text-xs">Minhas tarefas</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    {(statusFilter !== "all" || priorityFilter !== "all" || dateFilter !== "all" || assigneeFilter !== "all") && (
                      <div className="p-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-8 text-xs"
                          onClick={resetFilters}
                        >
                          <i className="fas fa-times mr-2"></i>
                          Limpar filtros
                        </Button>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Botão de ordenação com indicador visual */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant={sortBy !== "dueDate" || sortOrder !== "asc" ? "default" : "outline"} 
                      size="sm" 
                      className="h-9 px-3 min-w-[42px] sm:min-w-[120px]"
                    >
                      <i className="fas fa-sort text-sm sm:mr-2"></i>
                      <span className="hidden sm:inline">Ordenar por</span>
                      <span className="w-1 h-1 ml-1 rounded-full bg-primary-foreground/70"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-60">
                    <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortOrder("asc"); }}>
                      <i className={`fas fa-calendar-day mr-2 ${sortBy === "dueDate" && sortOrder === "asc" ? "text-primary" : ""}`}></i>
                      Data (mais próxima primeiro)
                      {sortBy === "dueDate" && sortOrder === "asc" && <i className="fas fa-check ml-2"></i>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortOrder("desc"); }}>
                      <i className={`fas fa-calendar-day mr-2 ${sortBy === "dueDate" && sortOrder === "desc" ? "text-primary" : ""}`}></i>
                      Data (mais distante primeiro)
                      {sortBy === "dueDate" && sortOrder === "desc" && <i className="fas fa-check ml-2"></i>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => { 
                        // Forçar a reordenação definindo em ordem reversa primeiro
                        setSortBy("status");
                        setTimeout(() => {
                          setSortBy("priority"); 
                          setSortOrder("desc");
                          console.log("Forçando ordenação: prioridade (alta → baixa)");
                        }, 10);
                      }}
                    >
                      <i className={`fas fa-tag mr-2 ${sortBy === "priority" && sortOrder === "desc" ? "text-primary" : ""}`}></i>
                      Prioridade (alta → baixa)
                      {sortBy === "priority" && sortOrder === "desc" && <i className="fas fa-check ml-2"></i>}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => { 
                        // Forçar a reordenação definindo em ordem reversa primeiro
                        setSortBy("status");
                        setTimeout(() => {
                          setSortBy("priority"); 
                          setSortOrder("asc");
                          console.log("Forçando ordenação: prioridade (baixa → alta)");
                        }, 10);
                      }}
                    >
                      <i className={`fas fa-tag mr-2 ${sortBy === "priority" && sortOrder === "asc" ? "text-primary" : ""}`}></i>
                      Prioridade (baixa → alta)
                      {sortBy === "priority" && sortOrder === "asc" && <i className="fas fa-check ml-2"></i>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setSortBy("status"); setSortOrder("asc"); }}>
                      <i className={`fas fa-tasks mr-2 ${sortBy === "status" && sortOrder === "asc" ? "text-primary" : ""}`}></i>
                      Status (a fazer → concluídas)
                      {sortBy === "status" && sortOrder === "asc" && <i className="fas fa-check ml-2"></i>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy("status"); setSortOrder("desc"); }}>
                      <i className={`fas fa-tasks mr-2 ${sortBy === "status" && sortOrder === "desc" ? "text-primary" : ""}`}></i>
                      Status (concluídas → a fazer)
                      {sortBy === "status" && sortOrder === "desc" && <i className="fas fa-check ml-2"></i>}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Botão limpar - visível apenas quando houver filtros ou pesquisa ativa */}
                {(statusFilter !== "all" || priorityFilter !== "all" || dateFilter !== "all" || assigneeFilter !== "all" || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-3 min-w-[42px]"
                    onClick={resetFilters}
                  >
                    <i className="fas fa-times text-sm"></i>
                  </Button>
                )}
              </div>
              
              {/* Resumo de filtros aplicados - mostra apenas quando houver filtros ativos */}
              {(statusFilter !== "all" || priorityFilter !== "all" || dateFilter !== "all" || assigneeFilter !== "all") && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {statusFilter !== "all" && (
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
                      {statusFilter === "todo" ? "A fazer" : 
                       statusFilter === "in_progress" ? "Em andamento" : 
                       "Concluídas"}
                    </span>
                  )}
                  {priorityFilter !== "all" && (
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
                      {priorityFilter === "high" ? "Alta" : 
                       priorityFilter === "medium" ? "Média" : 
                       "Baixa"}
                    </span>
                  )}
                  {dateFilter !== "all" && (
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
                      {dateFilter === "today" ? "Hoje" : 
                       dateFilter === "week" ? "Esta semana" : 
                       "Atrasadas"}
                    </span>
                  )}
                  {assigneeFilter !== "all" && (
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
                      Minhas tarefas
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {filteredAndSortedTasks.length} {filteredAndSortedTasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
                  </span>
                </div>
              )}
              
              {/* Contador de resultados - mostra apenas quando não há filtros, mas há resultados */}
              {(statusFilter === "all" && priorityFilter === "all" && dateFilter === "all" && assigneeFilter === "all") && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {filteredAndSortedTasks.length} {filteredAndSortedTasks.length === 1 ? 'tarefa' : 'tarefas'}
                </div>
              )}
            </div>
          </div>
          
          <TaskList
            title=""
            tasks={filteredAndSortedTasks}
            loading={tasksLoading}
            showEventName={false}
            showFilters={false}
          />
        </TabsContent>
        
        <TabsContent value="team">
          <div className="bg-card rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Equipe do Evento</h2>
              <Button 
                size="sm"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
            
            {/* Modal para selecionar membros da equipe */}
            <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Selecionar membros da equipe
                  </DialogTitle>
                  <DialogDescription>
                    Selecione membros da equipe geral para adicionar a este evento
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Barra de pesquisa */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar membros..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Lista de membros disponíveis */}
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {usersLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <div
                          key={user.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedMembers.includes(user.id) 
                              ? 'bg-primary/10 border border-primary/20' 
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                          onClick={() => {
                            setSelectedMembers(prev => 
                              prev.includes(user.id)
                                ? prev.filter(id => id !== user.id)
                                : [...prev, user.id]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedMembers.includes(user.id)}
                            className="pointer-events-none"
                          />
                          
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback>
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">Nenhum membro disponível para adicionar</p>
                      </div>
                    )}
                  </div>

                  {/* Link para adicionar novo membro à equipe geral */}
                  <div className="border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => {
                        setIsAddMemberModalOpen(false);
                        navigate("/team");
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      + Adicionar novo membro à equipe geral
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddMemberModalOpen(false);
                      setSelectedMembers([]);
                      setMemberSearchQuery("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedMembers.length === 0) {
                        toast({
                          title: "Nenhum membro selecionado",
                          description: "Selecione pelo menos um membro para adicionar.",
                          variant: "destructive",
                        });
                        return;
                      }

                      addTeamMembersMutation.mutate(selectedMembers);
                    }}
                    disabled={selectedMembers.length === 0 || addTeamMembersMutation.isPending}
                  >
                    {addTeamMembersMutation.isPending 
                      ? "Adicionando..." 
                      : `Adicionar ${selectedMembers.length > 0 ? `(${selectedMembers.length})` : ""}`
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {teamLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : team?.filter((member: any) => member.role !== 'vendor').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.filter((member: any) => member.role !== 'vendor').map((member: any) => (
                  <div key={member.id} className="bg-muted/50 p-4 rounded-lg group relative border hover:border-primary/20 transition-all">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={member.user.profileImageUrl} />
                        <AvatarFallback>
                          {getInitials(member.user.firstName, member.user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {member.role === 'organizer' ? 'Organizador' : 'Membro da Equipe'}
                        </Badge>
                      </div>

                      {/* Menu de três pontos apenas com opção remover */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <i className="fas fa-ellipsis-v text-gray-400"></i>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover ${member.user.firstName} da equipe deste evento?`)) {
                                removeTeamMemberMutation.mutate(member.user.id);
                              }
                            }}
                          >
                            <i className="fas fa-trash mr-2"></i>
                            Remover da equipe
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {member.user.email && (
                      <div className="mt-3 text-sm flex items-center text-muted-foreground">
                        <i className="fas fa-envelope mr-2 text-xs"></i>
                        <span className="truncate">{member.user.email}</span>
                      </div>
                    )}
                    
                    {member.user.phone && (
                      <div className="mt-1 text-sm flex items-center text-muted-foreground">
                        <i className="fas fa-phone mr-2 text-xs"></i>
                        <span>{member.user.phone}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum membro na equipe</h3>
                <p className="text-muted-foreground mb-6">Adicione membros da equipe geral para colaborar no evento</p>
                <Button onClick={() => setIsAddMemberModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Membro
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
      
      {/* Modal para adicionar membros */}
      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Membros à Equipe</DialogTitle>
            <DialogDescription>
              Selecione os membros da equipe geral que você deseja adicionar a este evento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar membros..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de membros disponíveis */}
            <div className="max-h-[300px] overflow-y-auto">
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Carregando usuários...</p>
                </div>
              ) : filteredUsers?.length > 0 ? (
                <div className="space-y-2">
                  {filteredUsers.map((user: any) => (
                    <div
                      key={user.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMembers.includes(user.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        if (selectedMembers.includes(user.id)) {
                          setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                        } else {
                          setSelectedMembers([...selectedMembers, user.id]);
                        }
                      }}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedMembers.includes(user.id)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedMembers.includes(user.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback>
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Nenhum usuário disponível</p>
                </div>
              )}
            </div>

            {/* Link para adicionar novo membro à equipe geral */}
            <div className="border-t pt-3">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/team");
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar novo membro à equipe geral
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setSelectedMembers([]);
                setMemberSearchQuery("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedMembers.length === 0) {
                  toast({
                    title: "Nenhum membro selecionado",
                    description: "Selecione pelo menos um membro para adicionar.",
                    variant: "destructive",
                  });
                  return;
                }

                addTeamMembersMutation.mutate(selectedMembers);
              }}
              disabled={selectedMembers.length === 0 || addTeamMembersMutation.isPending}
            >
              {addTeamMembersMutation.isPending ? "Adicionando..." : `Adicionar (${selectedMembers.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
