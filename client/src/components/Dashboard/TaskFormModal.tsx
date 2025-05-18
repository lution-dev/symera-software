import React, { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { createTaskSchema } from "@shared/schema";

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  taskId?: number; // Se fornecido, é modo de edição
  onSuccess?: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onOpenChange,
  eventId,
  taskId,
  onSuccess
}) => {
  const { toast } = useToast();
  const isEditMode = !!taskId;
  
  // Buscar detalhes do evento
  const { data: event } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && open,
  });
  
  // Buscar membros da equipe para atribuição
  const { data: team } = useQuery({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId && open,
  });
  
  // Buscar detalhes da tarefa no modo de edição
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId && isEditMode && open,
  });
  
  // Form para criação/edição de tarefa
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      status: "todo",
      priority: "medium",
      eventId: Number(eventId),
      assigneeId: "unassigned",
    },
  });
  
  // Preencher o formulário quando os dados da tarefa forem carregados (modo edição)
  useEffect(() => {
    if (task && isEditMode) {
      form.reset({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        status: task.status,
        priority: task.priority,
        eventId: Number(eventId),
        assigneeId: task.assigneeId || "unassigned",
      });
    }
  }, [task, form, eventId, isEditMode]);
  
  // Atualizar eventId no formulário quando ele mudar
  useEffect(() => {
    if (eventId) {
      form.setValue("eventId", Number(eventId));
    }
  }, [eventId, form]);
  
  // Mutation para criar tarefa
  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/events/${eventId}/tasks`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/tasks`] });
      if (onSuccess) onSuccess();
      form.reset({
        title: "",
        description: "",
        dueDate: "",
        status: "todo",
        priority: "medium",
        eventId: Number(eventId),
        assigneeId: "unassigned",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
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
      if (onSuccess) onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (data: any) => {
    // Converter o valor "unassigned" para string vazia, conforme esperado pelo backend
    const formattedData = {
      ...data,
      assigneeId: data.assigneeId === "unassigned" ? "" : data.assigneeId
    };
    
    if (isEditMode) {
      updateTaskMutation.mutate(formattedData);
    } else {
      createTaskMutation.mutate(formattedData);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? `Edite os detalhes da tarefa "${task?.title}"`
              : `Adicione uma nova tarefa ao evento ${event?.name}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      <SelectItem value="unassigned">Não atribuído</SelectItem>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
              >
                {createTaskMutation.isPending || updateTaskMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i> Salvando...
                  </>
                ) : isEditMode ? (
                  <>
                    <i className="fas fa-save mr-2"></i> Salvar Alterações
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i> Criar Tarefa
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;