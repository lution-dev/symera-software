import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { formatTaskDueDate, getTaskPriorityColor, getTaskStatusColor } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface ChecklistProps {
  id?: string;
}

const Checklist: React.FC<ChecklistProps> = ({ id }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [showNewTaskDialog, setShowNewTaskDialog] = React.useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = React.useState(false);
  const [currentTask, setCurrentTask] = React.useState<any>(null);
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterPriority, setFilterPriority] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Extract the event ID from the URL if not provided as a prop
  const eventId = id || location.split('/')[2];
  
  console.log("[Debug] Checklist - ID do evento recebido como prop:", id);
  console.log("[Debug] Checklist - ID do evento extraído da URL:", eventId);

  // Get event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated,
    retry: 1
  });

  // Get tasks for the event
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/tasks`],
    enabled: !!eventId && !!event,
  });

  // Get team members for task assignment
  const { data: team } = useQuery({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId && !!event,
  });

  // Form for creating new tasks
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      status: "todo",
      priority: "medium",
      eventId: Number(eventId),
      assigneeId: "",
    },
  });

  // Form for editing tasks
  const editForm = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      status: "todo",
      priority: "medium",
      eventId: Number(eventId),
      assigneeId: "",
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/events/${eventId}/tasks`, data);
    },
    onSuccess: () => {
      setShowNewTaskDialog(false);
      form.reset();
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/tasks`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/tasks/${currentTask.id}`, data);
    },
    onSuccess: () => {
      setShowEditTaskDialog(false);
      setCurrentTask(null);
      editForm.reset();
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/tasks`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/tasks`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number, status: string }) => {
      return apiRequest("PUT", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/tasks`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Regenerate checklist mutation
  const regenerateChecklistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/events/${eventId}/generate-checklist`);
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

  const handleCreateTask = (data: any) => {
    createTaskMutation.mutate(data);
  };

  const handleEditTask = (task: any) => {
    setCurrentTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      status: task.status,
      priority: task.priority,
      eventId: Number(id),
      assigneeId: task.assigneeId || "",
    });
    setShowEditTaskDialog(true);
  };

  const handleUpdateTask = (data: any) => {
    updateTaskMutation.mutate(data);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleUpdateTaskStatus = (taskId: number, status: string) => {
    updateTaskStatusMutation.mutate({ taskId, status });
  };

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task: any) => {
      // Filter by status
      const matchesStatus = filterStatus === "all" || task.status === filterStatus;
      
      // Filter by priority
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      
      // Filter by search term
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, filterStatus, filterPriority, searchTerm]);

  const handleRegenerateChecklist = () => {
    if (window.confirm("Tem certeza que deseja regenerar o checklist? As tarefas existentes serão preservadas, e novas tarefas serão adicionadas com base na IA.")) {
      regenerateChecklistMutation.mutate();
    }
  };

  if (eventLoading) {
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button 
            variant="link" 
            onClick={() => navigate(`/events/${eventId}`)} 
            className="text-primary hover:underline flex items-center mb-2 p-0"
          >
              <i className="fas fa-arrow-left mr-2"></i> Voltar para {event.name}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Checklist do Evento</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as tarefas para garantir um evento de sucesso
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button onClick={() => setShowNewTaskDialog(true)}>
            <i className="fas fa-plus mr-2"></i> Nova Tarefa
          </Button>
          <Button variant="outline" onClick={handleRegenerateChecklist} disabled={regenerateChecklistMutation.isPending}>
            {regenerateChecklistMutation.isPending ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i> Gerando...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i> Regenerar com IA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-2.5 text-muted-foreground"></i>
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="todo">A fazer</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {tasksLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-tasks text-primary text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
          <p className="text-muted-foreground mb-6">
            {tasks?.length > 0
              ? "Não foram encontradas tarefas com os filtros atuais. Tente alterar os filtros de busca."
              : "Este evento ainda não tem tarefas. Adicione tarefas ou gere um checklist com IA."}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setShowNewTaskDialog(true)}>
              <i className="fas fa-plus mr-2"></i> Adicionar Tarefa
            </Button>
            {tasks?.length === 0 && (
              <Button variant="outline" onClick={handleRegenerateChecklist} disabled={regenerateChecklistMutation.isPending}>
                <i className={`fas fa-${regenerateChecklistMutation.isPending ? "spinner animate-spin" : "magic"} mr-2`}></i>
                {regenerateChecklistMutation.isPending ? "Gerando..." : "Gerar com IA"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tarefa</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Limite</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsável</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredTasks.map((task: any) => {
                  // Find assignee if exists
                  const assignee = team?.find((member: any) => member.userId === task.assigneeId)?.user;
                  
                  return (
                    <tr key={task.id} className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-muted rounded-md flex items-center justify-center">
                            <i className={`fas fa-${task.status === 'completed' ? 'check' : 'tasks'} ${task.status === 'completed' ? 'text-green-500' : 'text-primary'}`}></i>
                          </div>
                          <div className="ml-4 max-w-md">
                            <div className={`text-sm font-medium ${task.status === 'completed' ? 'line-through opacity-60 text-muted-foreground' : 'text-white'}`}>{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.dueDate ? (
                          <div className="text-sm text-white">
                            {formatTaskDueDate(task.dueDate)}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Sem data</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignee ? (
                          <div className="flex items-center">
                            {assignee.profileImageUrl ? (
                              <img 
                                src={assignee.profileImageUrl} 
                                alt={`${assignee.firstName} ${assignee.lastName}`}
                                className="w-6 h-6 rounded-full object-cover mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                <span className="text-primary text-xs">
                                  {assignee.firstName?.charAt(0) || ''}
                                  {assignee.lastName?.charAt(0) || ''}
                                </span>
                              </div>
                            )}
                            <span className="text-sm">
                              {assignee.firstName} {assignee.lastName}
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Não atribuído</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                          {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em andamento' : 'A fazer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditTask(task)}
                          >
                            <i className="fas fa-edit text-primary"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateTaskStatus(
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
                            } text-${
                              task.status === 'todo' 
                                ? 'blue' 
                                : task.status === 'in_progress' 
                                  ? 'green' 
                                  : 'yellow'
                            }-400`}></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <i className="fas fa-trash text-red-400"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da tarefa para o evento {event.name}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da tarefa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Confirmar fornecedores" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detalhes adicionais sobre a tarefa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data limite</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="low">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Não atribuído</SelectItem>
                        {team?.map((member: any) => (
                          <SelectItem key={member.userId} value={member.userId}>
                            {member.user.firstName} {member.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowNewTaskDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i> Salvando...
                    </>
                  ) : (
                    <>Adicionar Tarefa</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Editar detalhes da tarefa para o evento {event.name}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateTask)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da tarefa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Confirmar fornecedores" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Detalhes adicionais sobre a tarefa"
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data limite</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="low">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">A fazer</SelectItem>
                          <SelectItem value="in_progress">Em andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Não atribuído</SelectItem>
                          {team?.map((member: any) => (
                            <SelectItem key={member.userId} value={member.userId}>
                              {member.user.firstName} {member.user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowEditTaskDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateTaskMutation.isPending}>
                  {updateTaskMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i> Salvando...
                    </>
                  ) : (
                    <>Atualizar Tarefa</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checklist;
