import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { createTaskSchema } from "@shared/schema";
interface TaskEditProps {
  eventId?: string;
  taskId?: string;
}

const TaskEdit: React.FC<TaskEditProps> = ({ eventId: propsEventId, taskId: propsTaskId }) => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Extrair os IDs dos props ou da URL se não estiverem disponíveis
  let eventId = propsEventId;
  let taskId = propsTaskId;
  
  // Caso os props não tenham sido passados, extrair da URL
  if (!eventId || !taskId) {
    console.log("IDs não recebidos via props, tentando extrair da URL...");
    const urlParts = location.split('/');
    eventId = eventId || urlParts[2];
    taskId = taskId || urlParts[4];
    console.log("IDs extraídos da URL:", { eventId, taskId });
  }
  
  // Buscar detalhes do evento
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated,
  });
  
  // Buscar detalhes da tarefa
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId && isAuthenticated,
  });
  
  // Buscar membros da equipe para atribuição
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId && !!event && isAuthenticated,
  });
  
  // Buscar responsáveis atuais da tarefa
  const { data: taskAssignees, isLoading: assigneesLoading } = useQuery({
    queryKey: [`/api/tasks/${taskId}/assignees`],
    enabled: !!taskId && isAuthenticated,
  });
  
  // Estado para controlar responsáveis selecionados
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  
  // Form para edição de tarefa
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      status: "todo",
      priority: "medium",
      eventId: Number(eventId),
      assigneeIds: [] as string[],
    },
  });
  
  // Preencher o formulário quando os dados da tarefa forem carregados
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        status: task.status,
        priority: task.priority,
        eventId: Number(eventId),
        assigneeIds: [],
      });
    }
  }, [task, form, eventId]);
  
  // Carregar os responsáveis atuais quando disponíveis
  useEffect(() => {
    if (taskAssignees && Array.isArray(taskAssignees)) {
      const assigneeIds = taskAssignees.map((assignee: any) => assignee.userId);
      setSelectedAssignees(assigneeIds);
      form.setValue('assigneeIds', assigneeIds);
    }
  }, [taskAssignees, form]);
  
  // Mutation para atualizar tarefa
  const updateTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/tasks`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      navigate(`/events/${eventId}`);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const handleUpdateTask = (data: any) => {
    // Incluir os IDs dos responsáveis selecionados
    const formattedData = {
      ...data,
      // Definir o primeiro responsável da lista como o principal (para compatibilidade)
      assigneeId: selectedAssignees.length > 0 ? selectedAssignees[0] : "",
      assigneeIds: selectedAssignees
    };
    updateTaskMutation.mutate(formattedData);
  };
  
  // Função para alternar seleção de responsável
  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev => {
      const isSelected = prev.includes(userId);
      let updated = [];
      
      if (isSelected) {
        // Remover da seleção
        updated = prev.filter(id => id !== userId);
      } else {
        // Adicionar à seleção
        updated = [...prev, userId];
      }
      
      // Atualizar o formulário
      form.setValue('assigneeIds', updated);
      return updated;
    });
  };
  
  if (eventLoading || taskLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!event || !task) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-xl p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-calendar-times text-destructive text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Tarefa não encontrada</h3>
          <p className="text-muted-foreground mb-6">
            A tarefa que você está procurando não existe ou você não tem permissão para acessá-la.
          </p>
          <Link href={`/events/${eventId}`}>
            <Button>
              <i className="fas fa-arrow-left mr-2"></i> Voltar para o Evento
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 mobile-spacing">
      {/* Header */}
      <div className="mb-6">
        {/* Desktop back button */}
        <Button 
          variant="link" 
          onClick={() => navigate(`/events/${eventId}`)} 
          className="hidden sm:flex text-primary hover:underline items-center mb-2 p-0"
        >
          <i className="fas fa-arrow-left mr-2"></i> Voltar para {event.name}
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Editar Tarefa</h1>
        <p className="text-muted-foreground mt-1">
          Editando a tarefa "{task.title}" do evento {event.name}
        </p>
      </div>
      
      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da tarefa*</FormLabel>
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
                      <FormLabel>Data de vencimento (opcional)</FormLabel>
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
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
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
              
              {/* Seleção de responsáveis */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Responsáveis (opcional)</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Selecione os usuários que devem ser responsáveis por esta tarefa
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {team?.filter((member: any) => 
                    // Na edição, mostrar apenas os responsáveis já selecionados
                    taskId ? selectedAssignees.includes(member.user.id) : true
                  ).map((member: any) => (
                    <div key={member.user.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`member-${member.user.id}`}
                        checked={selectedAssignees.includes(member.user.id)}
                        onCheckedChange={() => toggleAssignee(member.user.id)}
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={member.user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.firstName || '')}+${encodeURIComponent(member.user.lastName || '')}&background=random`} 
                            alt={`${member.user.firstName} ${member.user.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label
                          htmlFor={`member-${member.user.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {member.user.firstName} {member.user.lastName}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/events/${eventId}`)}
                  className="hidden sm:inline-flex"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i> Salvando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i> Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskEdit;