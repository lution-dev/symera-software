import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  CalendarIcon, 
  Filter, 
  Plus,
  Tag,
  UserCircle2,
  CheckCircle2,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import GoogleStyleCalendar from "@/components/GoogleStyleCalendar";

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  eventId: number;
  eventName?: string;
}

interface Event {
  id: number;
  name: string;
  date: string;
  type: string;
  location?: string;
}

const Schedule: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = React.useState<string | null>(null);
  const [eventFilter, setEventFilter] = React.useState<number | null>(null);
  const [showNewItemDialog, setShowNewItemDialog] = React.useState<boolean>(false);
  const [showDayDetailsDialog, setShowDayDetailsDialog] = React.useState<boolean>(false);
  
  // Query para buscar todas as tarefas do usuário
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: true,
  });
  
  // Query para buscar todos os eventos do usuário
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: true,
  });
  
  // Funções para filtrar tarefas e eventos pela data selecionada
  const getTasksForSelectedDate = (date: Date) => {
    if (!tasks.length) return [];
    
    let filteredTasks = tasks.filter((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Aplicar filtros adicionais se estiverem ativos
    if (statusFilter) {
      filteredTasks = filteredTasks.filter((task: Task) => task.status === statusFilter);
    }
    
    if (priorityFilter) {
      filteredTasks = filteredTasks.filter((task: Task) => task.priority === priorityFilter);
    }
    
    if (eventFilter) {
      filteredTasks = filteredTasks.filter((task: Task) => task.eventId === eventFilter);
    }
    
    return filteredTasks;
  };
  
  const getEventsForSelectedDate = (date: Date) => {
    if (!events.length) return [];
    
    let filteredEvents = events.filter((event: Event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Aplicar filtro de evento se estiver ativo
    if (eventFilter) {
      filteredEvents = filteredEvents.filter((event: Event) => event.id === eventFilter);
    }
    
    return filteredEvents;
  };
  
  // Resetar todos os filtros
  const resetFilters = () => {
    setStatusFilter(null);
    setPriorityFilter(null);
    setEventFilter(null);
  };
  
  // Obter o status da tarefa em português
  const getTaskStatusLabel = (status: string) => {
    switch (status) {
      case "todo": return "A fazer";
      case "in_progress": return "Em andamento";
      case "completed": return "Concluído";
      default: return status;
    }
  };
  
  // Obter cor para o status da tarefa
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
      case "in_progress": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };
  
  // Função para lidar com a seleção de data
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDayDetailsDialog(true);
  };
  
  // Função para abrir o diálogo para adicionar um novo item
  const handleAddItem = (date: Date) => {
    setSelectedDate(date);
    setShowNewItemDialog(true);
  };
  
  return (
    <div className="container max-w-full px-2 sm:px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground mt-1">Organize seus eventos e tarefas no calendário</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-4 w-4" />
                Filtrar
                {(statusFilter || priorityFilter || eventFilter) && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                    {(statusFilter ? 1 : 0) + (priorityFilter ? 1 : 0) + (eventFilter ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filtros</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 inline-block mr-2" />
                  Status
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setStatusFilter("todo")}>
                  <span className="w-3 h-3 rounded-full bg-slate-300 mr-2"></span>
                  A fazer
                  {statusFilter === "todo" && " ✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                  <span className="w-3 h-3 rounded-full bg-amber-300 mr-2"></span>
                  Em andamento
                  {statusFilter === "in_progress" && " ✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  <span className="w-3 h-3 rounded-full bg-green-300 mr-2"></span>
                  Concluído
                  {statusFilter === "completed" && " ✓"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  <Tag className="h-4 w-4 inline-block mr-2" />
                  Prioridade
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setPriorityFilter("low")}>
                  <span className="w-3 h-3 rounded-full bg-blue-300 mr-2"></span>
                  Baixa
                  {priorityFilter === "low" && " ✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>
                  <span className="w-3 h-3 rounded-full bg-amber-300 mr-2"></span>
                  Média
                  {priorityFilter === "medium" && " ✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("high")}>
                  <span className="w-3 h-3 rounded-full bg-red-300 mr-2"></span>
                  Alta
                  {priorityFilter === "high" && " ✓"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  <UserCircle2 className="h-4 w-4 inline-block mr-2" />
                  Eventos
                </DropdownMenuLabel>
                {events.map((event: Event) => (
                  <DropdownMenuItem key={event.id} onClick={() => setEventFilter(event.id)}>
                    <span className="w-3 h-3 rounded-full bg-purple-300 mr-2"></span>
                    {event.name.length > 20 ? `${event.name.substring(0, 20)}...` : event.name}
                    {eventFilter === event.id && " ✓"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-center mt-2"
                onClick={resetFilters}
              >
                Limpar filtros
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar novo item</DialogTitle>
                <DialogDescription>
                  Adicione um novo evento ou tarefa na data selecionada: {formatDate(selectedDate)}
                </DialogDescription>
              </DialogHeader>
              
              {/* Formulário simplificado com navegação para as páginas de criação */}
              <div className="space-y-4 py-4">
                <div className="flex justify-center space-x-4 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      try {
                        setShowNewItemDialog(false);
                        // Navegar diretamente para o formulário de criação de evento com a URL correta
                        // Armazenar a data selecionada em localStorage para acessar na página de criação de evento
                        localStorage.setItem('selectedEventDate', selectedDate.toISOString().split('T')[0]);
                        navigate("/events/new");
                        toast({
                          title: "Criando novo evento",
                          description: "Preencha os dados para o seu novo evento"
                        });
                      } catch (err) {
                        console.error("Erro ao navegar:", err);
                      }
                    }}
                  >
                    Novo Evento
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowNewItemDialog(false);
                      navigate("/events");
                      toast({
                        title: "Selecione um evento",
                        description: "Clique em um evento para adicionar tarefas a ele"
                      });
                    }}
                  >
                    Nova Tarefa
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>Cancelar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1">
        {/* Calendário estilo Google - ocupa a tela toda */}
        <Card className="overflow-hidden">
          <CardContent className="p-3 sm:p-6 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <CardTitle>Calendário</CardTitle>
                <CardDescription>
                  Visualize seus eventos e tarefas
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary/70"></span>
                  <span>Eventos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500/70"></span>
                  <span>Em andamento</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500/70"></span>
                  <span>Concluído</span>
                </div>
              </div>
            </div>
            
            <GoogleStyleCalendar
              events={events}
              tasks={tasks}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              onAddItem={handleAddItem}
            />
          </CardContent>
        </Card>
        
        {/* Dialog mostrando os detalhes do dia - substitui o painel lateral */}
        <Dialog open={showDayDetailsDialog} onOpenChange={setShowDayDetailsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {formatDate(selectedDate)}
              </DialogTitle>
              <DialogDescription>
                {getEventsForSelectedDate(selectedDate).length + getTasksForSelectedDate(selectedDate).length === 0 
                  ? "Nenhum item neste dia"
                  : `${getEventsForSelectedDate(selectedDate).length} eventos, ${getTasksForSelectedDate(selectedDate).length} tarefas`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary mr-2"></span>
                  Eventos
                  <Badge variant="outline" className="ml-2">
                    {getEventsForSelectedDate(selectedDate).length}
                  </Badge>
                </h3>
                
                {getEventsForSelectedDate(selectedDate).length > 0 ? (
                  <div className="space-y-2">
                    {getEventsForSelectedDate(selectedDate).map((event: Event) => (
                      <div 
                        key={event.id} 
                        className="p-3 rounded-lg bg-card border-l-4 border-l-primary border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{event.name}</h4>
                          <span className="text-xs bg-primary/10 text-primary dark:text-primary-foreground px-2 py-1 rounded">
                            {event.type}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-sm text-muted-foreground">
                            {event.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Nenhum evento neste dia</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                  Tarefas
                  <Badge variant="outline" className="ml-2">
                    {getTasksForSelectedDate(selectedDate).length}
                  </Badge>
                </h3>
                
                {getTasksForSelectedDate(selectedDate).length > 0 ? (
                  <div className="space-y-2">
                    {getTasksForSelectedDate(selectedDate).map((task: Task) => (
                      <div 
                        key={task.id} 
                        className={`p-3 rounded-lg border hover:border-blue-500 transition-all hover:shadow-md cursor-pointer ${
                          task.status === "todo" ? "border-l-4 border-l-slate-400" :
                          task.status === "in_progress" ? "border-l-4 border-l-amber-500" :
                          "border-l-4 border-l-green-500"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.priority === "low" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                              task.priority === "medium" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                              "bg-red-500/20 text-red-600 dark:text-red-400"
                            }`}>
                              {task.priority === "low" ? "Baixa" : 
                               task.priority === "medium" ? "Média" : "Alta"}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getTaskStatusColor(task.status)}`}>
                              {getTaskStatusLabel(task.status)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center justify-between mt-1">
                          {task.eventName && (
                            <p className="text-sm text-muted-foreground">
                              Evento: {task.eventName}
                            </p>
                          )}
                          {task.description && (
                            <p className="text-xs text-muted-foreground max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                              {task.description.length > 60 ? `${task.description.substring(0, 60)}...` : task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Nenhuma tarefa neste dia</p>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex sm:justify-between items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  setShowNewItemDialog(true);
                  setShowDayDetailsDialog(false);
                }}
              >
                <Plus className="h-4 w-4" />
                Adicionar item
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDayDetailsDialog(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Schedule;