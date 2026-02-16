import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TaskList from "@/components/Dashboard/TaskList";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { ScheduleList } from "@/components/Schedule/ScheduleList";
import { ExpenseManager } from "@/components/Finance/ExpenseManager";
import { DocumentManager } from "@/components/Documents/DocumentManager";
import { ParticipantsList } from "@/components/ParticipantsList";
import { FeedbackManager } from "@/components/Feedback/FeedbackManager";
import { formatDate, formatCurrency, calculateTaskProgress, getEventTypeLabel, getInitials, formatActivityTimestamp } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phone?: string;
}

interface TeamMember {
  id: number;
  eventId: number;
  userId: string;
  role: string;
  permissions: Record<string, any>;
  createdAt: string;
  user: User;
}

interface TaskAssignee {
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

interface Reminder {
  id: number;
  taskId: number;
  userId: string;
  scheduledTime: string;
  channel: "whatsapp";
  sent: boolean;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  eventId: number;
  assignees?: TaskAssignee[];
  reminders?: Reminder[];
}

interface Activity {
  id: number;
  eventId: number;
  userId: string;
  action: string;
  details: Record<string, any>;
  createdAt: string;
  userName?: string;
  eventName?: string;
}

interface EventData {
  id: number;
  name: string;
  type: string;
  date: string;
  location?: string;
  ownerId: string;
  budget?: number;
  expenses?: number;
  status?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  coverImageUrl?: string;
  team?: TeamMember[];
  attendees?: number;
  refetch?: () => void;
}

// Utility function to calculate days remaining consistently
const calculateDaysRemaining = (eventDate: string) => {
  const targetDate = new Date(eventDate);
  const today = new Date();

  // Reset both dates to midnight UTC to ensure accurate day calculation
  today.setUTCHours(0, 0, 0, 0);
  targetDate.setUTCHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
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

  // Estados para modais
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);
  const [isGenerateChecklistDialogOpen, setIsGenerateChecklistDialogOpen] = useState(false);

  // Filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [search, setSearch] = useState(window.location.search);

  // Sincronizar estado com a URL (search params)
  useEffect(() => {
    const handleLocationChange = () => {
      setSearch(window.location.search);
    };

    // Patch pushState para detectar mudanças de query params feitas pelo roteador
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Scroll ao topo quando a seção mudar (especialmente para mobile)
  useEffect(() => {
    if (window.innerWidth < 768 && activeSection !== 'resumo') {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'auto' });
      }
    }
  }, [activeSection]);

  // Team member selection modal state
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Extrair o ID da URL se não recebido como prop
  const eventId = id || location.split('/')[2];

  // Configuração para garantir que dados recentes sejam carregados sempre
  // Fetch event details
  const { data: event, isLoading, error, refetch } = useQuery<EventData>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
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

    // Verificar se existe um parâmetro de aba na URL
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || params.get('section');
    if (tab) {
      // Mapear 'tarefas' para a seção correta se necessário, ou usar direto
      if (tab === 'tarefas' || tab === 'tasks') {
        setActiveSection('tarefas');
      } else if (['resumo', 'equipe', 'participantes', 'cronograma', 'financeiro', 'documentos', 'atividades', 'feedback', 'mobile_details'].includes(tab)) {
        setActiveSection(tab);
      }
    } else {
      setActiveSection('resumo');
    }
  }, [eventId, refetch, location, search]);

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: [`/api/events/${eventId}/tasks`],
    enabled: !!eventId && !!event,
  });

  // Fetch team members
  const { data: team, isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId && !!event,
  });

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: [`/api/events/${eventId}/activities`],
    enabled: !!eventId && !!event,
  });

  // Fetch all users available for adding to team
  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAddMemberModalOpen,
    retry: 1,
    staleTime: 0,
  });

  // Filter users that are not already team members
  const availableUsers = allUsers?.filter((user: any) =>
    !team?.some((member: any) => member.userId === user.id)
  ) || [];

  // Filter users based on search query
  const filteredUsers = availableUsers.filter((user: any) =>
    user.firstName?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

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

  // Mutation para adicionar múltiplos membros à equipe
  const addTeamMembersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      return apiRequest(`/api/events/${eventId}/team`, {
        method: "POST",
        body: JSON.stringify({ userIds }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Membros adicionados",
        description: `${variables.length} membro(s) adicionado(s) à equipe do evento.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
      setIsAddMemberModalOpen(false);
      setSelectedMembers([]);
      setMemberSearchQuery("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro à equipe.",
        variant: "destructive",
      });
    },
  });

  // Mutation para remover membro da equipe
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return apiRequest(`/api/events/${eventId}/team/${memberId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (data, memberId) => {
      toast({
        title: "Membro removido",
        description: `O membro foi removido da equipe do evento.`,
      });
      // Invalidar múltiplas queries relacionadas
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      queryClient.refetchQueries({ queryKey: [`/api/events/${eventId}/team`] });
      setMemberToRemove(null);
    },
    onError: (error) => {
      console.error("Erro ao remover membro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da equipe.",
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
    deleteEventMutation.mutate();
    setIsDeleteEventDialogOpen(false);
  };

  const handleRegenerateChecklist = () => {
    setIsGenerateChecklistDialogOpen(true);
  };

  const confirmRegenerateChecklist = () => {
    regenerateChecklistMutation.mutate();
    setIsGenerateChecklistDialogOpen(false);
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

  const renderStrategicIndicators = () => (
    <>
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
              <span className="font-semibold">{formatCurrency(Math.abs(event.expenses || 0) / 100)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Saldo restante:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency((event.budget || 0) - (Math.abs(event.expenses || 0) / 100))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gasto atual:</span>
              <span className="font-semibold">
                {event.budget && event.expenses && event.budget > 0
                  ? `${Math.round(((Math.abs(event.expenses) / 100) / event.budget) * 100)}%`
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
            <i className="fas fa-clock text-primary mr-2"></i> Cronograma
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Data:</span>
              <span className="font-semibold text-right">
                {event.startDate ? (
                  (() => {
                    const startDate = new Date(event.startDate);
                    const endDate = event.endDate ? new Date(event.endDate) : null;

                    // Verifica se o evento dura mais de um dia
                    if (endDate && startDate.toDateString() !== endDate.toDateString()) {
                      // Formato para múltiplos dias: "26 Jun - 29 Jun"
                      const startFormatted = startDate.toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short'
                      });
                      const endFormatted = endDate.toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short'
                      });
                      return `${startFormatted} - ${endFormatted}`;
                    } else {
                      // Formato para um dia: inclui o ano
                      return formatDate(event.startDate);
                    }
                  })()
                ) : "A definir"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Horário:</span>
              <span className="font-semibold text-right">
                {event.startTime && event.endTime
                  ? `${event.startTime} - ${event.endTime}`
                  : "A definir"
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duração:</span>
              <span className="font-semibold text-right">
                {event.startDate ? (
                  (() => {
                    const startDate = new Date(event.startDate);
                    const endDate = event.endDate ? new Date(event.endDate) : startDate;

                    // Calcula diferença em dias
                    const diffTime = endDate.getTime() - startDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays > 1) {
                      return `${diffDays} dias`;
                    } else if (event.startTime && event.endTime) {
                      // Para eventos de um dia, calcula duração em horas
                      const start = new Date(`2025-01-01T${event.startTime}`);
                      const end = new Date(`2025-01-01T${event.endTime}`);
                      const diffMs = end.getTime() - start.getTime();
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      return `${diffHours}h${diffMinutes > 0 ? `${diffMinutes}m` : ''}`;
                    } else {
                      return "1 dia";
                    }
                  })()
                ) : "A definir"}
              </span>
            </div>
            {event.startDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Faltam:</span>
                <span className="font-semibold text-right">
                  {(() => {
                    const diffDays = calculateDaysRemaining(event.startDate);
                    return diffDays > 0 ? `${diffDays} dias` : diffDays === 0 ? "Hoje" : "Finalizado";
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
                      const diffDays = calculateDaysRemaining(event.startDate);
                      return diffDays > 0
                        ? ` e faltam ${diffDays} dias para o evento acontecer.`
                        : diffDays === 0
                          ? `. O evento é hoje!`
                          : `. O evento já passou.`;
                    })()
                  ) : '.'}
                </span>
              ) : (
                <span>
                  Todas as tarefas foram concluídas!
                  {event.startDate ? (
                    (() => {
                      const diffDays = calculateDaysRemaining(event.startDate);
                      return diffDays > 0
                        ? ` Faltam ${diffDays} dias para o evento acontecer.`
                        : diffDays === 0
                          ? ` O evento é hoje!`
                          : ` O evento já passou.`;
                    })()
                  ) : ''}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-0 py-0">
      {/* Header bar fixo com breadcrumb - mantido visível durante rolagem */}
      <div className="hidden sm:block fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border w-full">
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
        </div>
      </div>

      {/* Espaçamento para compensar o header fixo */}
      <div className="hidden md:block h-14"></div>

      {/* Layout principal com sidebar lateral e conteúdo */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-150px)]">
        {/* Sidebar - Visível em desktop, escondida em mobile */}
        <div className="hidden md:block w-64 bg-card rounded-lg shadow-md border border-border sticky top-14 overflow-y-auto h-fit">
          {/* Cabeçalho do evento na sidebar */}
          <div className="overflow-hidden">
            {/* Imagem de capa */}
            <div className="relative h-[100px]">
              <img
                src={event.coverImageUrl || getDefaultCover()}
                alt={`${event.name} - ${getEventTypeLabel(event.type)}`}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            </div>
            {/* Informações do evento */}
            <div className="p-3">
              <h3 className="font-medium text-base line-clamp-1">{event.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center">
                <span>{getEventTypeLabel(event.type)}</span>
                {event.location && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="truncate">{event.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Separador sutil */}
          <div className="h-px bg-border mx-4"></div>

          <div className="py-4 px-4">
            {/* Menu lateral - apenas abas de navegação, sem título */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('resumo')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'resumo' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="far fa-file mr-2"></i> Resumo
              </button>
              <button
                onClick={() => setActiveSection('tarefas')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'tarefas' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="fas fa-tasks mr-2"></i> Tarefas ({totalTasks})
              </button>
              <button
                onClick={() => setActiveSection('equipe')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'equipe' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="far fa-user-circle mr-2"></i> Equipe
              </button>
              <button
                onClick={() => setActiveSection('participantes')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'participantes' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="far fa-address-book mr-2"></i> Lista de Participantes
              </button>
              <button
                onClick={() => setActiveSection('cronograma')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'cronograma' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="far fa-calendar-alt mr-2"></i> Cronograma
              </button>
              <button
                onClick={() => setActiveSection('financeiro')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'financeiro' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="far fa-money-bill-alt mr-2"></i> Financeiro
              </button>
              <button
                onClick={() => setActiveSection('documentos')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'documentos' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="far fa-file-pdf mr-2"></i> Documentos
              </button>
              <button
                onClick={() => setActiveSection('atividades')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'atividades' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="fas fa-history mr-2"></i> Atividades
              </button>
              <button
                onClick={() => setActiveSection('feedback')}
                className={`w-full flex items-center px-3 py-2 rounded-md ${activeSection === 'feedback' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                  }`}
              >
                <i className="far fa-comment-alt mr-2"></i> Feedback pós-evento
              </button>
            </nav>
          </div>
        </div>



        {/* Conteúdo principal */}
        <div className="flex-1 p-4 md:px-6 md:py-0 overflow-x-hidden">
          {/* Conteúdo baseado na seção ativa */}
          {activeSection === "resumo" && (
            <div className="space-y-4">
              {/* Cabeçalho principal do evento */}
              <div className="rounded-xl overflow-hidden shadow-md mb-4">
                {/* Imagem de capa com informações do evento sobrepostas */}
                <div className="relative h-48 sm:h-64 md:h-[220px]">
                  <img
                    src={event.coverImageUrl || getDefaultCover()}
                    alt={`${event.name} - ${getEventTypeLabel(event.type)}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-background/70 sm:from-background/95 sm:to-background/30"></div>

                  {/* Botões de ação no canto superior direito */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button
                      onClick={handleEditClick}
                      variant="secondary"
                      className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-sm"
                      size="sm"
                    >
                      <i className="fas fa-edit mr-2"></i> Editar Evento
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-sm"
                          size="sm"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setIsDeleteEventDialogOpen(true)}
                        >
                          <i className="fas fa-trash mr-2"></i>
                          Excluir Evento
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge className="px-2 py-1 text-xs font-medium" variant="secondary">
                        {getEventTypeLabel(event.type)}
                      </Badge>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'planning' ? 'bg-[hsl(var(--event-planning))]/25 text-[hsl(var(--event-planning))] border border-[hsl(var(--event-planning))]/30' :
                        event.status === 'confirmed' ? 'bg-[hsl(var(--event-confirmed))]/25 text-[hsl(var(--event-confirmed))] border border-[hsl(var(--event-confirmed))]/30' :
                          event.status === 'in_progress' ? 'bg-[hsl(var(--event-in-progress))]/25 text-[hsl(var(--event-in-progress))] border border-[hsl(var(--event-in-progress))]/30' :
                            event.status === 'active' ? 'bg-[hsl(var(--event-in-progress))]/25 text-[hsl(var(--event-in-progress))] border border-[hsl(var(--event-in-progress))]/30' :
                              event.status === 'completed' ? 'bg-[hsl(var(--event-completed))]/25 text-[hsl(var(--event-completed))] border border-[hsl(var(--event-completed))]/30' :
                                event.status === 'cancelled' ? 'bg-[hsl(var(--event-cancelled))]/25 text-[hsl(var(--event-cancelled))] border border-[hsl(var(--event-cancelled))]/30' :
                                  'bg-[hsl(var(--event-planning))]/25 text-[hsl(var(--event-planning))] border border-[hsl(var(--event-planning))]/30'
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
                <div className="bg-card p-5 border-t border-border rounded-b-xl">
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
                            event.endDate && new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() ? (
                              <span>
                                {formatDate(event.startDate)}{event.startTime && ` às ${event.startTime.substring(0, 5)}`} até {formatDate(event.endDate)}{event.endTime && ` às ${event.endTime.substring(0, 5)}`}
                              </span>
                            ) : event.startTime && event.endTime && event.startTime !== event.endTime ? (
                              <span>
                                {formatDate(event.startDate)} de {event.startTime.substring(0, 5)} às {event.endTime.substring(0, 5)}
                              </span>
                            ) : (
                              <span>
                                {formatDate(event.startDate)}{event.startTime && ` às ${event.startTime.substring(0, 5)}`}
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

              <div className="hidden md:block">
                {renderStrategicIndicators()}
              </div>
              {/* Mobile Navigation Grid */}
              <div className="md:hidden mt-4 mb-8">
                <h3 className="text-sm font-medium mb-4 px-1">Menu do Evento</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'mobile_details', label: 'Detalhes', icon: 'fas fa-info-circle', color: 'bg-primary/10 text-primary' },
                    { id: 'tarefas', label: 'Tarefas', count: totalTasks, icon: 'fas fa-tasks', color: 'bg-blue-500/10 text-blue-600' },
                    { id: 'equipe', label: 'Equipe', count: team?.length, icon: 'far fa-user-circle', color: 'bg-indigo-500/10 text-indigo-600' },
                    { id: 'participantes', label: 'Participantes', count: event.attendees, icon: 'far fa-address-book', color: 'bg-green-500/10 text-green-600' },
                    { id: 'cronograma', label: 'Cronograma', icon: 'fas fa-calendar-alt', color: 'bg-orange-500/10 text-orange-600' },
                    { id: 'financeiro', label: 'Financeiro', icon: 'far fa-money-bill-alt', color: 'bg-emerald-500/10 text-emerald-600' },
                    { id: 'documentos', label: 'Documentos', icon: 'fas fa-file-pdf', color: 'bg-red-500/10 text-red-600' },
                    { id: 'atividades', label: 'Atividades', icon: 'fas fa-history', color: 'bg-purple-500/10 text-purple-600' },
                    { id: 'feedback', label: 'Feedback', icon: 'fas fa-comment-alt', color: 'bg-pink-500/10 text-pink-600' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        const from = new URLSearchParams(search).get('from');
                        const navigateUrl = `${location}?section=${item.id}${from ? `&from=${from}` : ''}`;
                        setActiveSection(item.id);
                        navigate(navigateUrl);
                      }}
                      className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-muted/50 transition-colors shadow-sm"
                    >
                      <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-lg`}>
                        <i className={item.icon}></i>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium block text-foreground">{item.label}</span>
                        {item.count !== undefined && (
                          <span className="text-xs text-muted-foreground">{item.count} itens</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Detail Section */}
          {activeSection === "mobile_details" && (
            <div className="space-y-4">
              {renderStrategicIndicators()}
            </div>
          )}

          {activeSection === "tarefas" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h2 className="text-xl font-semibold">Checklist do Evento ({totalTasks})</h2>
                <div className="flex flex-wrap w-full sm:w-auto gap-2">
                  <Button
                    onClick={handleRegenerateChecklist}
                    variant="secondary"
                    className="flex-1 sm:flex-auto bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={regenerateChecklistMutation.isPending}
                  >
                    {regenerateChecklistMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Gerando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-wand-magic-sparkles mr-2"></i> Gerar com IA
                      </>
                    )}
                  </Button>
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
                />
              )}
            </div>
          )}

          {activeSection === "equipe" && (
            <div className="bg-card rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Equipe do Evento</h2>
                <Button onClick={() => setIsAddMemberModalOpen(true)} variant="default">
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
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {member.role === 'organizer' ? 'Organizador' :
                                member.role === 'vendor' ? 'Fornecedor' :
                                  member.role === 'team_member' ? 'Membro da Equipe' : member.role}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <i className="fas fa-ellipsis-v text-gray-400 text-sm"></i>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setMemberToRemove(member)}
                                >
                                  <i className="fas fa-trash mr-2"></i>
                                  Remover da equipe
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                  <Button onClick={() => setIsAddMemberModalOpen(true)} variant="default">
                    <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeSection === "atividades" && (
            <div className="space-y-4">
              <ActivityFeed
                activities={activities || []}
                loading={activitiesLoading}
                limit={10}
              />
            </div>
          )}

          {/* Lista de Participantes */}
          {activeSection === "participantes" && (
            <div className="space-y-4">
              <ParticipantsList eventId={Number(eventId)} />
            </div>
          )}

          {/* Cronograma */}
          {activeSection === "cronograma" && (
            <div className="space-y-4">
              <ScheduleList eventId={Number(eventId)} />
            </div>
          )}

          {/* Financeiro */}
          {activeSection === "financeiro" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold">Financeiro</h2>
              </div>

              {/* Cards de resumo financeiro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-card rounded-lg border border-border p-3 md:p-4">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-wallet text-blue-500 text-sm flex-shrink-0"></i>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Orçamento Total</p>
                      <p className="text-lg md:text-2xl font-bold mb-0 truncate">{formatCurrency(event.budget || 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-3 md:p-4">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-arrow-down text-red-500 text-sm flex-shrink-0"></i>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Gastos Atuais</p>
                      <p className="text-lg md:text-2xl font-bold mb-0 text-red-600 truncate">{formatCurrency(Math.abs(event.expenses || 0) / 100)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-3 md:p-4">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-balance-scale text-green-500 text-sm flex-shrink-0"></i>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Saldo</p>
                      <p className="text-lg md:text-2xl font-bold mb-0 text-green-500 truncate">
                        {formatCurrency((event.budget || 0) - (Math.abs(event.expenses || 0) / 100))}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-3 md:p-4 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-user-friends text-purple-500 text-sm flex-shrink-0"></i>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Custo por Convidado</p>
                      <p className="text-lg md:text-2xl font-bold mb-0 truncate">
                        {event.attendees ? formatCurrency((event.budget || 0) / event.attendees) : 'R$ 0,00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de despesas */}
              <div className="bg-card rounded-lg border border-border p-3 md:p-6">
                <ExpenseManager eventId={Number(eventId)} />
              </div>
            </div>
          )}

          {/* Documentos */}
          {activeSection === "documentos" && (
            <div className="space-y-4">
              {/* Componente de gerenciamento de documentos */}
              <DocumentManager eventId={Number(eventId)} />
            </div>
          )}

          {/* Feedback pós-evento */}
          {activeSection === "feedback" && (
            <div className="space-y-4">
              <FeedbackManager eventId={Number(eventId)} />
            </div>
          )}
        </div>
      </div>

      {/* Modal de Adicionar Membro */}
      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fas fa-user-plus text-primary"></i>
              Adicionar Membro à Equipe
            </DialogTitle>
            <DialogDescription>
              Selecione usuários para adicionar à equipe deste evento. Eles poderão colaborar e acessar informações do evento.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Campo de busca */}
            <div className="mb-4">
              <Input
                placeholder="Buscar usuários por nome ou email..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Lista de usuários disponíveis */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div className="text-sm text-muted-foreground mb-2">Usuários disponíveis:</div>

              {usersLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedMembers.includes(user.id)
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
                        {getInitials(`${user.firstName || ''} ${user.lastName || ''}`)}
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
                  <p className="text-sm">Nenhum usuário disponível para adicionar</p>
                </div>
              )}
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
                : selectedMembers.length > 0
                  ? `Adicionar Membros (${selectedMembers.length})`
                  : "Adicionar Membros"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Remoção */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remover membro da equipe
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{memberToRemove?.user?.firstName} {memberToRemove?.user?.lastName}</strong> da equipe deste evento?
              <br /><br />
              Esta ação não pode ser desfeita e o membro perderá acesso a todas as informações e tarefas relacionadas ao evento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRemove(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToRemove) {
                  removeTeamMemberMutation.mutate(memberToRemove.id);
                }
              }}
              disabled={removeTeamMemberMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeTeamMemberMutation.isPending ? "Removendo..." : "Remover da equipe"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação de Geração de Checklist com IA */}
      <AlertDialog open={isGenerateChecklistDialogOpen} onOpenChange={setIsGenerateChecklistDialogOpen}>
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
              <i className="fas fa-wand-magic-sparkles text-purple-600 dark:text-purple-400 text-xl"></i>
            </div>
            <AlertDialogTitle className="text-center text-lg">
              Gerar Checklist com Inteligência Artificial
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              <p>
                A IA irá analisar os detalhes do seu evento e criar automaticamente uma lista de tarefas personalizadas.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-left text-sm text-amber-800 dark:text-amber-300">
                <div className="flex items-start gap-2">
                  <i className="fas fa-triangle-exclamation mt-0.5 flex-shrink-0"></i>
                  <span>As tarefas existentes serão mantidas. Novas tarefas geradas pela IA serão adicionadas ao checklist atual.</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-2">
            <AlertDialogCancel className="sm:min-w-[120px]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRegenerateChecklist}
              disabled={regenerateChecklistMutation.isPending}
              className="bg-purple-600 text-white hover:bg-purple-700 sm:min-w-[120px]"
            >
              {regenerateChecklistMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Gerando...
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles mr-2"></i> Gerar Tarefas
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação de Exclusão do Evento */}
      <AlertDialog open={isDeleteEventDialogOpen} onOpenChange={setIsDeleteEventDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Excluir Evento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento <strong>{event?.name}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita e todos os dados relacionados ao evento serão permanentemente removidos, incluindo:
              <br />
              • Todas as tarefas
              <br />
              • Membros da equipe
              <br />
              • Atividades e histórico
              <br />
              • Documentos e anexos
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteEventDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEventMutation.isPending ? "Excluindo..." : "Excluir Evento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default EventDetail;