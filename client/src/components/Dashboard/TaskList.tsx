import React, { useState } from "react";
import { formatTaskDueDate, getTaskPriorityColor, getTaskStatusColor, cn } from "@/lib/utils";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Play,
  RotateCcw,
  Pencil,
  Trash2,
  Bell,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Calendar,
  ClipboardList,
  MessageCircle,
  AlertTriangle,
  User,
  Send,
  ChevronRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
    phone?: string;
  }>;
  reminders?: Reminder[];
}

// Mock for reminders
const getMockReminders = (taskId: number): Reminder[] => {
  if (taskId % 2 === 0) {
    return [
      {
        id: 1,
        taskId,
        userId: "8650891",
        scheduledTime: new Date(Date.now() - 3600000).toISOString(),
        channel: "whatsapp",
        sent: true,
        sentAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        taskId,
        userId: "8650891",
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        channel: "whatsapp",
        sent: false
      }
    ];
  }
  return [];
};

interface TaskListProps {
  title?: string;
  tasks?: Task[];
  loading?: boolean;
  showEventName?: boolean;
  onTaskUpdate?: (taskId: number, data: Partial<Task>) => void;
  onTaskDelete?: (taskId: number) => void;
  limitTasks?: boolean;
  showFilters?: boolean;
}

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
  const isMobile = useIsMobile();

  const { data: apiTasks, isLoading: apiLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    enabled: !propTasks,
    select: (data: any) => data.pendingTasks,
  });

  const tasks = propTasks || apiTasks || [];
  const loading = propLoading || (apiLoading && !propTasks);

  const filteredTasks = tasks.filter((task: Task) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mine') return task.assignees?.some(a => a.userId === '8650891');
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

  const displayTasks = (!showAllTasks && limitTasks) ? filteredTasks.slice(0, 5) : filteredTasks;

  // DEBUG LOG
  if (displayTasks.length > 0 && Math.random() > 0.9) {
    console.log("[TaskList] Tasks received:", displayTasks);
    console.log("[TaskList] First task eventName:", displayTasks[0].eventName);
  }

  const enhancedTasks = displayTasks.map((task: Task) => ({
    ...task,
    reminders: getMockReminders(task.id)
  }));

  const handleStatusChange = async (taskId: number, newStatus: "todo" | "in_progress" | "completed") => {
    if (!onTaskUpdate) {
      try {
        await apiRequest(`/api/tasks/${taskId}`, { method: "PATCH", body: { status: newStatus } as any });
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
        await apiRequest(`/api/tasks/${taskId}`, { method: "DELETE" });
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
    alert("Lembrete enviado com sucesso!");
    setIsReminderDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6 border border-white/5 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-muted/50 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (enhancedTasks.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-8 border border-white/5 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Tudo pronto!</h3>
        <p className="text-muted-foreground mt-2 max-w-[240px] mx-auto text-sm">
          Nenhuma tarefa pendente no momento. Aproveite sua produtividade!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" /> {title}
        </h2>
        {limitTasks && tasks.length > 5 && (
          <button
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            {showAllTasks ? 'Ver menos' : 'Ver todas'} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Header with Filters - Clean background */}
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex flex-wrap gap-2">
            {(['all', 'mine', 'pending', 'week'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-105"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {filter === 'all' && 'Todas'}
                {filter === 'mine' && 'Minhas'}
                {filter === 'pending' && 'Em aberto'}
                {filter === 'week' && 'Semana'}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
            {enhancedTasks.length} {enhancedTasks.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>
      )}

      {/* Desktop & Tablet Card View */}
      <div className="hidden sm:flex flex-col gap-4">
        {enhancedTasks.map((task: any) => (
          <div
            key={task.id}
            className="group relative bg-card/40 hover:bg-card/60 rounded-3xl p-5 border border-white/5 hover:border-primary/30 transition-all duration-500 shadow-xl backdrop-blur-md hover:-translate-y-1"
          >
            {/* Subtle gloss effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center justify-between gap-8">
              {/* Task Title and Info */}
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className={cn(
                  "w-4 h-4 rounded-full shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-white/10 animate-pulse",
                  task.priority === 'high' ? 'bg-red-500 shadow-red-500/40' :
                    task.priority === 'medium' ? 'bg-amber-500 shadow-amber-500/40' :
                      'bg-blue-500 shadow-blue-500/40'
                )} />

                <div className="min-w-0 flex-1">
                  <div
                    className="cursor-pointer group/title"
                    onClick={() => navigate(`/events/${task.eventId}/tasks`)}
                  >
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className={cn(
                        "text-lg font-black tracking-tight truncate transition-all group-hover/title:text-primary",
                        task.status === 'completed' ? 'line-through opacity-30 text-muted-foreground' : 'text-white'
                      )}>
                        {task.title}
                      </p>
                      {showEventName && (
                        <span className="text-[9px] font-black uppercase text-primary/90 bg-primary/10 px-2 py-0.5 rounded-md tracking-widest border border-primary/10 opacity-60 group-hover/title:opacity-100 transition-opacity">
                          {task.eventName || "Evento"}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground/60 line-clamp-1 font-medium">
                      {task.description.split('\n')[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Meta - More structured for desktop */}
              <div className="flex items-center gap-10 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-muted-foreground/40 mb-1 tracking-[0.2em]">Prazo</span>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-white/90">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'N/A'}</span>
                    {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                      <span className="text-[9px] text-red-400 font-black uppercase mt-0.5 tracking-tighter bg-red-500/10 px-1.5 py-0.5 rounded">ATRASADO</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground/40 mb-1 tracking-[0.2em]">Status</span>
                  <span className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase rounded-xl border-2 shadow-lg whitespace-nowrap transition-all duration-500",
                    task.status === 'completed'
                      ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/10"
                      : task.status === 'in_progress'
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10"
                  )}>
                    {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em Curso' : 'Pendente'}
                  </span>
                </div>

                {/* Actions - Glassmorphism floating effect */}
                <div className="flex justify-end gap-1.5 items-center bg-white/5 backdrop-blur-sm p-1.5 rounded-2xl border border-white/5 shadow-inner">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-9 w-9 rounded-xl transition-all duration-300",
                            task.status === 'completed'
                              ? "hover:bg-blue-500/20 hover:text-blue-400 hover:rotate-12"
                              : "hover:bg-primary/20 hover:text-primary hover:scale-110"
                          )}
                          onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                        >
                          {task.status === 'completed' ? <RotateCcw className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-purple-dark text-white border-white/10 text-[10px] font-black uppercase tracking-widest">
                        {task.status === 'completed' ? 'Reiniciar' : 'Concluir'}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-yellow-500/20 hover:text-yellow-400 transition-all duration-300 hover:rotate-12"
                          onClick={() => openReminderDialog(task)}
                        >
                          <Bell className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-purple-dark text-white border-white/10 text-[10px] font-black uppercase tracking-widest">
                        Lembretes
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-indigo-500/20 hover:text-indigo-400 transition-all duration-300 hover:rotate-12"
                          onClick={() => navigate(`/events/${task.eventId}/tasks/${task.id}/edit`)}
                        >
                          <Pencil className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-purple-dark text-white border-white/10 text-[10px] font-black uppercase tracking-widest">
                        Editar
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 hover:scale-110"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-purple-dark text-white border-white/10 text-[10px] font-black uppercase tracking-widest">
                        Arquivar
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden flex flex-col gap-3">
        {enhancedTasks.map((task: any) => (
          <div key={task.id} className="p-4 bg-card/40 rounded-2xl border border-white/5 shadow-lg backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                )} />
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/events/${task.eventId}/tasks`)}
                >
                  <p className={cn(
                    "text-sm font-bold leading-tight",
                    task.status === 'completed' && "line-through opacity-50"
                  )}>
                    {task.title}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap ml-4">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sem data'}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1.5">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 bg-primary/5 border-primary/20 text-primary"
                  onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                >
                  {task.status === 'completed' ? <RotateCcw className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 bg-amber-500/5 border-amber-500/20 text-amber-500"
                  onClick={() => navigate(`/events/${task.eventId}/tasks/${task.id}/edit`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openReminderDialog(task)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-yellow-500"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <p className="text-[10px] font-black uppercase text-muted-foreground/80 px-2 py-1 bg-muted/30 rounded-md">
                  {task.eventName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {limitTasks && tasks.length > 5 && (
        <button
          onClick={() => setShowAllTasks(!showAllTasks)}
          className="w-full py-4 text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-white/5 flex items-center justify-center gap-2"
        >
          {showAllTasks ? (
            <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Ver mais {tasks.length - 5} tarefas</>
          )}
        </button>
      )}

      {/* Notification / Reminder Dialog / Drawer */}
      {isMobile ? (
        <Drawer open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
          <DrawerContent className="bg-purple-dark border-white/10 pb-10 px-4">
            <DrawerHeader className="text-left px-2 mb-2">
              <DrawerTitle className="text-xl font-bold flex items-center gap-2 text-white">
                <Bell className="w-5 h-5 text-yellow-500" /> Notificações
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground/80">
                Gerencie os lembretes para a tarefa {currentTask?.title}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-6 py-4 px-2">
              {/* Assignees */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Responsáveis</h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentTask?.assignees?.map(assignee => (
                    <div key={assignee.userId} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {assignee.profileImageUrl ? <img src={assignee.profileImageUrl} alt="AV" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{assignee.firstName} {assignee.lastName}</p>
                          <p className="text-[11px] text-muted-foreground">{assignee.phone || 'Sem contato'}</p>
                        </div>
                      </div>
                      {assignee.phone && <MessageCircle className="w-5 h-5 text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Histórico de Lembretes</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {currentTask?.reminders && currentTask.reminders.length > 0 ? (
                    currentTask.reminders.map((reminder) => (
                      <div key={reminder.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", reminder.sent ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-500")}>
                            {reminder.sent ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">
                              {new Date(reminder.scheduledTime).toLocaleDateString()} às {new Date(reminder.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[11px] text-muted-foreground">WhatsApp Business</span>
                          </div>
                        </div>
                        {reminder.sent ? (
                          <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-1 rounded-md">Enviado</span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">Agendado</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center py-6 text-muted-foreground italic bg-white/5 rounded-2xl border border-dashed border-white/10">Nenhum lembrete programado.</p>
                  )}
                </div>
              </div>
            </div>

            <DrawerFooter className="px-0 pt-4 flex flex-col gap-3">
              <Button
                className="w-full h-12 rounded-xl text-sm font-black tracking-tight gradient-primary shadow-lg shadow-primary/20 gap-2"
                onClick={handleSendReminderNow}
              >
                <Send className="w-4 h-4" /> Enviar Agora via WhatsApp
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-muted-foreground active:scale-[0.98]">
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl bg-purple-dark border-white/10 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                <Bell className="w-5 h-5 text-yellow-500" /> Notificações
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground/80">
                Gerencie os lembretes para a tarefa {currentTask?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Assignees */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Responsáveis</h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentTask?.assignees?.map(assignee => (
                    <div key={assignee.userId} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {assignee.profileImageUrl ? <img src={assignee.profileImageUrl} alt="AV" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{assignee.firstName} {assignee.lastName}</p>
                          <p className="text-[10px] text-muted-foreground">{assignee.phone || 'Sem contato'}</p>
                        </div>
                      </div>
                      {assignee.phone && <MessageCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  ))}
                  {(!currentTask?.assignees || currentTask.assignees.length === 0) && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-dashed border-white/20 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><User className="w-4 h-4" /></div>
                      <p className="text-xs font-bold italic">Nenhum responsável</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reminders List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Histórico de Lembretes</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {currentTask?.reminders && currentTask.reminders.length > 0 ? (
                    currentTask.reminders.map((reminder) => (
                      <div key={reminder.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded-lg", reminder.sent ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-500")}>
                            {reminder.sent ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">
                              {new Date(reminder.scheduledTime).toLocaleDateString()} às {new Date(reminder.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-muted-foreground">WhatsApp Business</span>
                          </div>
                        </div>
                        {reminder.sent ? (
                          <span className="text-[10px] font-black uppercase text-green-500">Enviado</span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-amber-500">Agendado</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center py-4 text-muted-foreground italic">Nenhum lembrete programado.</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button
                className="w-full h-12 rounded-xl text-sm font-bold gradient-primary shadow-lg shadow-primary/20 gap-2"
                onClick={handleSendReminderNow}
              >
                <Send className="w-4 h-4" /> Enviar Agora via WhatsApp
              </Button>
              <Button variant="ghost" className="w-full h-10 rounded-xl text-xs font-bold text-muted-foreground" onClick={() => setIsReminderDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TaskList;
