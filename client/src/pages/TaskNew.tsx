import React, { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { createTaskSchema } from "@shared/schema";

const TaskNew: React.FC = () => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Extrair o ID do evento da URL
  const eventId = location.split('/')[2];
  
  // Buscar detalhes do evento
  const { data: event, isLoading: eventLoading } = useQuery<any>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated,
  });
  
  // Buscar membros da equipe para atribuição
  const { data: team, isLoading: teamLoading } = useQuery<any>({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId && !!event && isAuthenticated,
  });
  
  // Form para criação de tarefa
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
      assigneeIds: [],
    },
  });
  
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
      navigate(`/events/${eventId}`);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  const handleCreateTask = (data: any) => {
    // Format the data for the backend
    const formattedData = {
      ...data,
      // Keep assigneeId for backward compatibility (set to first assignee or empty)
      assigneeId: data.assigneeIds && data.assigneeIds.length > 0 
        ? data.assigneeIds[0] 
        : (data.assigneeId === "unassigned" ? "" : data.assigneeId)
    };
    createTaskMutation.mutate(formattedData);
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
    <div className="container mx-auto px-4 py-6 custom-scrollbar">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Button 
          variant="link" 
          onClick={() => navigate(`/events/${eventId}`)} 
          className="text-primary hover:underline flex items-center mb-2 p-0 hidden md:flex"
        >
          <i className="fas fa-arrow-left mr-2"></i> Voltar para {event.name}
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Nova Tarefa</h1>
        <p className="text-muted-foreground mt-1">
          Adicione uma nova tarefa ao evento {event.name}
        </p>
      </div>
      
      {/* Form */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
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
                name="assigneeIds"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Responsáveis (opcional)</FormLabel>
                      <div className="space-y-2">
                        {Array.isArray(team) && team.map((member: any) => (
                          <div key={member.userId} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`member-${member.userId}`}
                              checked={Array.isArray(field.value) && field.value.indexOf(member.userId) >= 0}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...(field.value || []), member.userId]
                                  : (field.value || []).filter((id) => id !== member.userId);
                                field.onChange(updated);
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label 
                              htmlFor={`member-${member.userId}`}
                              className="flex items-center cursor-pointer text-sm font-medium"
                            >
                              <img 
                                src={member.user.profileImageUrl} 
                                alt={`${member.user.firstName} ${member.user.lastName}`} 
                                className="w-6 h-6 rounded-full object-cover mr-2"
                              />
                              {member.user.firstName} {member.user.lastName}
                            </label>
                          </div>
                        ))}
                        {(!team || !Array.isArray(team) || team.length === 0) && (
                          <div className="text-sm text-muted-foreground">
                            Nenhum membro da equipe disponível
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/events/${eventId}`)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i> Salvando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus mr-2"></i> Criar Tarefa
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

export default TaskNew;