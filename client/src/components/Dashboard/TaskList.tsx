import React, { useState } from "react";
import { formatTaskDueDate, getTaskPriorityColor, getTaskStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskAssignee {
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  phone?: string;
}

interface Reminder {
  id: number;
  taskId: number;
  userId: string;
  scheduledTime: string;
  channel: "whatsapp";
  sent: boolean;
  sentAt?: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  eventId: number;
  eventName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assignees?: Array<{
    userId: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }>;
  reminders?: Reminder[];
}

interface TaskListProps {
  title?: string;
  tasks?: Task[];
  loading?: boolean;
  showEventName?: boolean;
  onTaskUpdate?: (taskId: number, data: Partial<Task>) => void;
  onTaskDelete?: (taskId: number) => void;
  limitTasks?: boolean; // Indica se deve limitar a exibição para apenas 5 tarefas
  showFilters?: boolean; // Indica se deve mostrar filtros rápidos
}

// Este é um mock dos dados de assignees e reminders
// Em um cenário real, esses dados viriam do back-end
const getMockTaskAssignees = (taskId: number): TaskAssignee[] => {
  // Extrair os nomes dos colaboradores da descrição da tarefa
  return [
    {
      userId: "8650891",
      firstName: "Lucas",
      lastName: "Pires",
      profileImageUrl: "https://storage.googleapis.com/replit/images/1745976054259_80bddf1c737225f5a76b693617927c0d.png",
      phone: "+55 (11) 99999-9999"
    },
    {
      userId: "user1",
      firstName: "João",
      lastName: "Silva",
      profileImageUrl: "https://ui-avatars.com/api/?name=João+Silva",
      phone: "+55 (11) 98888-8888"
    },
    {
      userId: "user2",
      firstName: "Maria",
      lastName: "Santos",
      profileImageUrl: "https://ui-avatars.com/api/?name=Maria+Santos",
      phone: "+55 (11) 97777-7777"
    },
    {
      userId: "user3",
      firstName: "Carlos",
      lastName: "Oliveira",
      profileImageUrl: "https://ui-avatars.com/api/?name=Carlos+Oliveira",
      phone: "+55 (11) 96666-6666"
    }
  ];
};

// Mock para reminders
const getMockReminders = (taskId: number): Reminder[] => {
  if (taskId % 2 === 0) {
    return [
      {
        id: 1,
        taskId,
        userId: "8650891",
        scheduledTime: "2025-10-01T09:00:00Z",
        channel: "whatsapp",
        sent: true,
        sentAt: "2025-10-01T09:00:05Z"
      },
      {
        id: 2,
        taskId,
        userId: "8650891",
        scheduledTime: "2025-10-10T09:00:00Z",
        channel: "whatsapp",
        sent: true,
        sentAt: "2025-10-10T09:00:12Z"
      }
    ];
  } else {
    return [];
  }
};

const TaskList: React.FC<TaskListProps> = ({
  title = "Tarefas Pendentes",
  tasks: propTasks,
  loading: propLoading,
  showEventName = true,
  onTaskUpdate,
  onTaskDelete,
  limitTasks = false,
  showFilters = false
}) => {
  const [, navigate] = useLocation();
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'pending' | 'week'>('all');
  const [showAllTasks, setShowAllTasks] = useState(!limitTasks);
  
  // If tasks are not provided via props, fetch them from the API
  const { data: apiTasks, isLoading: apiLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    enabled: !propTasks,
    select: (data) => data.pendingTasks,
  });

  const tasks = propTasks || apiTasks || [];
  const loading = propLoading || (apiLoading && !propTasks);

  // Aplicar filtros às tarefas
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mine') return task.assignees?.some(a => a.userId === '8650891'); // ID do usuário logado
    if (activeFilter === 'pending') return task.status !== 'completed';
    if (activeFilter === 'week') {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      if (!taskDate) return false;
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return taskDate <= nextWeek;
    }
    return true;
  });

  // Vamos usar as tarefas já ordenadas enviadas pelo componente pai
  // As tarefas já vêm ordenadas do Event.tsx

  // Limitar a 5 tarefas se limitTasks for true e showAllTasks for false
  const displayTasks = (!showAllTasks && limitTasks) ? filteredTasks.slice(0, 5) : filteredTasks;
  
  // Usar os dados reais de responsáveis, apenas adicionar reminders mock
  const enhancedTasks = displayTasks.map(task => ({
    ...task,
    // Usar os dados de responsáveis que vêm da API, não substituir por mocks
    reminders: getMockReminders(task.id)
  }));

  const handleStatusChange = async (taskId: number, newStatus: "todo" | "in_progress" | "completed") => {
    if (!onTaskUpdate) {
      try {
        await apiRequest("PATCH", `/api/tasks/${taskId}`, { status: newStatus });
        // Refresh tasks after update
        window.location.reload();
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    } else {
      onTaskUpdate(taskId, { status: newStatus });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!onTaskDelete) {
      try {
        await apiRequest("DELETE", `/api/tasks/${taskId}`);
        // Refresh tasks after delete
        window.location.reload();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    } else {
      onTaskDelete(taskId);
    }
  };

  const openReminderDialog = (task: Task) => {
    setCurrentTask(task);
    setIsReminderDialogOpen(true);
  };

  const handleSendReminderNow = () => {
    // Simulação de envio de lembrete
    alert("Lembrete enviado com sucesso!");
    setIsReminderDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (enhancedTasks.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-check text-primary text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhuma tarefa pendente</h3>
          <p className="text-muted-foreground">Você concluiu todas as suas tarefas ou ainda não criou nenhuma.</p>
        </div>
      </div>
    );
  }

  // Desktop version
  const desktopView = (
    <div className="hidden sm:block overflow-x-auto">
      <table className="min-w-full divide-y divide-border/30">
        <thead>
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tarefa</th>
            {showEventName && (
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Evento</th>
            )}
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Limite</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridade</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsáveis</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lembretes</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {enhancedTasks.map((task) => (
            <tr key={task.id}>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-orange-400' : 
                    'bg-blue-400'
                  }`}></div>
                  <div className="ml-3 max-w-xs">
                    <div className={`text-sm font-medium ${task.status === 'completed' ? 'line-through opacity-60 text-muted-foreground' : ''}`}>{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description.replace(/\*\*Colaboradores:.+$/gm, '').trim()}</div>
                    )}
                  </div>
                </div>
              </td>
              {showEventName && (
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{task.eventName}</div>
                </td>
              )}
              <td className="px-4 py-3 whitespace-nowrap">
                {task.dueDate ? (
                  <>
                    <div className="text-sm">{formatTaskDueDate(task.dueDate).split('(')[0]}</div>
                    {formatTaskDueDate(task.dueDate).includes('(') && (
                      <div className={`text-xs ${
                        formatTaskDueDate(task.dueDate).includes('Atrasado') 
                          ? 'text-red-400' 
                          : formatTaskDueDate(task.dueDate).includes('Hoje') 
                            ? 'text-yellow-400' 
                            : 'text-muted-foreground'
                      }`}>
                        ({formatTaskDueDate(task.dueDate).split('(')[1].replace(')', '')})
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Sem data</div>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                  {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em andamento' : 'A fazer'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex -space-x-1">
                  {task.assignees && task.assignees.slice(0, 3).map((assignee, index) => (
                    <TooltipProvider key={assignee.userId} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-6 h-6 rounded-full border border-border overflow-hidden z-[1]" style={{ zIndex: 10 - index }}>
                            {assignee.profileImageUrl ? (
                              <img
                                src={assignee.profileImageUrl}
                                alt={`${assignee.firstName} ${assignee.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-[10px]">
                                  {assignee.firstName?.charAt(0) || ''}
                                  {assignee.lastName?.charAt(0) || ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{assignee.firstName} {assignee.lastName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {task.assignees && task.assignees.length > 3 && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center border border-border z-0">
                            <span className="text-[10px] text-muted-foreground">+{task.assignees.length - 3}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {task.assignees.slice(3).map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <button
                    onClick={() => openReminderDialog(task)}
                    className="p-1 hover:bg-muted/20 rounded flex items-center"
                  >
                    <i className="fas fa-bell text-yellow-400 mr-1 text-xs"></i>
                    {task.reminders && task.reminders.length > 0 ? (
                      <span className="text-xs border border-border/50 rounded-full px-1.5 py-0.5">{task.reminders.length}</span>
                    ) : (
                      <span className="text-xs border border-border/50 rounded-full px-1.5 py-0.5">0</span>
                    )}
                  </button>
                  <button
                    onClick={() => openReminderDialog(task)}
                    className="ml-2 p-1 hover:bg-muted/20 rounded"
                  >
                    <i className="fas fa-cog text-blue-400 text-xs"></i>
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2 border ${
                      task.status === 'todo' 
                        ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/5' 
                        : task.status === 'in_progress' 
                          ? 'border-green-500/30 text-green-400 hover:bg-green-500/5' 
                          : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/5'
                    }`}
                    onClick={() => handleStatusChange(
                      task.id, 
                      task.status === 'todo' 
                        ? 'in_progress' 
                        : task.status === 'in_progress' 
                          ? 'completed' 
                          : 'todo'
                    )}
                  >
                    <i className={`fas fa-${
                      task.status === 'todo' 
                        ? 'play' 
                        : task.status === 'in_progress' 
                          ? 'check' 
                          : 'redo'
                    } mr-1.5`}></i>
                    <span className="text-xs whitespace-nowrap">
                      {task.status === 'todo' 
                        ? 'Iniciar' 
                        : task.status === 'in_progress' 
                          ? 'Concluir' 
                          : 'Reabrir'}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      console.log(`Navegando para: /events/${task.eventId}/tasks/${task.id}/edit`);
                      navigate(`/events/${task.eventId}/tasks/${task.id}/edit`);
                    }}
                    title="Editar"
                  >
                    <i className="fas fa-pencil-alt text-amber-400"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Excluir"
                  >
                    <i className="fas fa-trash text-red-400"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile version
  const mobileView = (
    <div className="sm:hidden space-y-3">
      {enhancedTasks.map((task) => (
        <div key={task.id} className="border border-border/40 rounded-lg overflow-hidden">
          <div className="p-3 flex items-start">
            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
              task.priority === 'high' ? 'bg-red-500' : 
              task.priority === 'medium' ? 'bg-orange-400' : 
              'bg-blue-400'
            }`}></div>
            <div className="ml-2 flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className={`text-sm font-medium ${task.status === 'completed' ? 'line-through opacity-60 text-muted-foreground' : ''} truncate pr-2`}>
                  {task.title}
                </div>
                <div className="flex -space-x-1 flex-shrink-0 ml-1">
                  {task.assignees && task.assignees.slice(0, 2).map((assignee, index) => (
                    <div 
                      key={assignee.userId} 
                      className="w-5 h-5 rounded-full border border-border overflow-hidden" 
                      style={{ zIndex: 10 - index }}
                    >
                      {assignee.profileImageUrl ? (
                        <img
                          src={assignee.profileImageUrl}
                          alt={`${assignee.firstName} ${assignee.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary text-[9px]">
                            {assignee.firstName?.charAt(0) || ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {task.assignees && task.assignees.length > 2 && (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center border border-border">
                      <span className="text-[9px] text-muted-foreground">+{task.assignees.length - 2}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground truncate">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sem data'}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-sm ${
                  task.status === 'in_progress' ? 'bg-amber-400/10 text-amber-400' :
                  task.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                  'bg-blue-400/10 text-blue-400'
                }`}>
                  {task.status === 'in_progress' ? 'Em progresso' : 
                   task.status === 'completed' ? 'Concluída' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Mobile actions */}
          <div className="px-3 py-2 border-t border-border/30 flex justify-between items-center gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openReminderDialog(task)}
                className="p-1.5 hover:bg-muted rounded-md flex items-center"
              >
                <i className="fas fa-bell text-yellow-400 mr-1"></i>
                {task.reminders && task.reminders.length > 0 ? (
                  <span className="text-xs bg-muted rounded-full px-1.5 py-0.5">{task.reminders.length}</span>
                ) : (
                  <i className="fas fa-exclamation-triangle text-amber-500 text-xs"></i>
                )}
              </button>
              
              <Button
                variant="outline"
                size="sm"
                className={`h-8 px-2 ${
                  task.status === 'todo' 
                    ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30' 
                    : task.status === 'in_progress' 
                      ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30' 
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
                }`}
                onClick={() => handleStatusChange(
                  task.id, 
                  task.status === 'todo' 
                    ? 'in_progress' 
                    : task.status === 'in_progress' 
                      ? 'completed' 
                      : 'todo'
                )}
              >
                <i className={`fas fa-${
                  task.status === 'todo' 
                    ? 'play' 
                    : task.status === 'in_progress' 
                      ? 'check' 
                      : 'redo'
                } mr-1.5`}></i>
                <span className="text-xs whitespace-nowrap">
                  {task.status === 'todo' 
                    ? 'Iniciar' 
                    : task.status === 'in_progress' 
                      ? 'Concluir' 
                      : 'Reabrir'}
                </span>
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => navigate(`/events/${task.eventId}/tasks/${task.id}/edit`)}
              >
                <i className="fas fa-pencil-alt text-amber-400 mr-1.5"></i>
                <span className="text-xs">Editar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleDeleteTask(task.id)}
              >
                <i className="fas fa-trash text-red-400 mr-1.5"></i>
                <span className="text-xs">Excluir</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        {/* Área de Filtros Rápidos */}
        {showFilters && (
          <div className="px-4 py-2 border-b border-border/30 flex flex-wrap gap-2 overflow-x-auto">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-xs rounded-full border ${
                activeFilter === 'all' 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'border-border/50 text-muted-foreground hover:bg-muted/10'
              }`}
            >
              🔘 Todas
            </button>
            <button 
              onClick={() => setActiveFilter('mine')}
              className={`px-3 py-1 text-xs rounded-full border ${
                activeFilter === 'mine' 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'border-border/50 text-muted-foreground hover:bg-muted/10'
              }`}
            >
              🔘 Somente minhas
            </button>
            <button 
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1 text-xs rounded-full border ${
                activeFilter === 'pending' 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'border-border/50 text-muted-foreground hover:bg-muted/10'
              }`}
            >
              🔘 Somente pendentes
            </button>
            <button 
              onClick={() => setActiveFilter('week')}
              className={`px-3 py-1 text-xs rounded-full border ${
                activeFilter === 'week' 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'border-border/50 text-muted-foreground hover:bg-muted/10'
              }`}
            >
              🔘 Até 7 dias
            </button>
          </div>
        )}
        
        {desktopView}
        {mobileView}
        
        {/* Botão Ver Todas as Tarefas */}
        {limitTasks && data && Array.isArray(data) && data.length > 5 && (
          <div className="p-3 border-t border-border/30 flex justify-center">
            <button
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
            >
              {showAllTasks ? (
                <>
                  <i className="fas fa-chevron-up mr-2 text-xs"></i>
                  Mostrar menos tarefas
                </>
              ) : (
                <>
                  <i className="fas fa-chevron-down mr-2 text-xs"></i>
                  Ver todas as tarefas ({data.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Dialog para configuração de lembretes */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Lembretes</DialogTitle>
            <DialogDescription>
              {currentTask?.title && `Lembretes para a tarefa "${currentTask.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Responsáveis</h4>
              <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto space-y-2">
                {currentTask?.assignees?.map(assignee => (
                  <div key={assignee.userId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        {assignee.profileImageUrl ? (
                          <img
                            src={assignee.profileImageUrl}
                            alt={`${assignee.firstName} ${assignee.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary text-xs">
                              {assignee.firstName?.charAt(0) || ''}
                              {assignee.lastName?.charAt(0) || ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{assignee.firstName} {assignee.lastName}</p>
                        <p className="text-xs text-muted-foreground">{assignee.phone || "Nenhum telefone cadastrado"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Lembretes Programados</h4>
              <div className="bg-muted p-3 rounded-md">
                {currentTask?.reminders && currentTask.reminders.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {currentTask.reminders.map((reminder, index) => (
                      <div key={index} className="text-sm p-2 hover:bg-background/30 rounded-md">
                        <div className="font-medium">
                          {new Date(reminder.scheduledTime).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          }) + " • " + 
                          new Date(reminder.scheduledTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs flex items-center">
                          <i className="fab fa-whatsapp text-green-500 mr-1"></i> 
                          <span>WhatsApp</span>
                          {reminder.sent && (
                            <span className="ml-2 text-xs text-green-500 flex items-center">
                              <i className="fas fa-check mr-1"></i> Enviado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground">Nenhum lembrete configurado</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Os lembretes são criados automaticamente pela IA com base nas datas das tarefas.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Button onClick={handleSendReminderNow}>
                <i className="fas fa-paper-plane mr-2"></i> Enviar Lembrete Agora
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskList;
