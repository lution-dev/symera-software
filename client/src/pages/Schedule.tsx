import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { 
  CalendarIcon, 
  Filter, 
  CalendarDays, 
  Calendar as CalendarWeek,
  CalendarRange,
  Plus,
  Tag,
  UserCircle2,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [activeView, setActiveView] = React.useState<"day" | "week" | "month">("month");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = React.useState<string | null>(null);
  const [eventFilter, setEventFilter] = React.useState<number | null>(null);
  
  // Query para buscar todas as tarefas do usuário
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: true,
  });
  
  // Query para buscar todos os eventos do usuário
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
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
  
  // Função para destacar datas no calendário com eventos ou tarefas
  const getTotalItemsForDate = (date: Date) => {
    const eventCount = events.filter((event: Event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    }).length;
    
    const taskCount = tasks.filter((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    }).length;
    
    return { eventCount, taskCount, total: eventCount + taskCount };
  };
  
  // Resetar todos os filtros
  const resetFilters = () => {
    setStatusFilter(null);
    setPriorityFilter(null);
    setEventFilter(null);
  };
  
  // Adicionar classe para dias com eventos ou tarefas
  const getDayClassNames = (date: Date) => {
    const hasEvent = events.some((event: Event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
    
    const hasTask = tasks.some((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
    
    const hasPendingTask = tasks.some((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear() &&
        task.status !== "completed"
      );
    });
    
    if (hasEvent && hasPendingTask) return "bg-primary/30 text-primary-foreground dark:bg-primary/40 font-medium rounded-full";
    if (hasEvent) return "bg-purple-500/30 dark:bg-purple-500/40 font-medium rounded-full";
    if (hasPendingTask) return "bg-orange-500/30 dark:bg-orange-500/40 font-medium rounded-full";
    if (hasTask && !hasPendingTask) return "bg-green-500/30 dark:bg-green-500/40 font-medium rounded-full";
    
    return "";
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
  
  // Obter ícone para o dia atual baseado no view atual
  const getViewIcon = () => {
    switch (activeView) {
      case "day": return <CalendarDays className="h-4 w-4 mr-2" />;
      case "week": return <CalendarWeek className="h-4 w-4 mr-2" />;
      case "month": return <CalendarRange className="h-4 w-4 mr-2" />;
      default: return <CalendarRange className="h-4 w-4 mr-2" />;
    }
  };
  
  return (
    <div className="container max-w-full px-2 sm:px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground mt-1">Organize seus eventos e tarefas no calendário</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Hoje
          </Button>
          
          <Tabs defaultValue={activeView} className="bg-background/95 backdrop-blur-sm border rounded-md" onValueChange={(value: string) => setActiveView(value as "day" | "week" | "month")}>
            <TabsList className="w-full p-0.5">
              <TabsTrigger value="day" className="flex items-center data-[state=active]:bg-accent">
                <CalendarDays className="h-4 w-4 mr-1.5" />
                Dia
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center data-[state=active]:bg-accent">
                <CalendarWeek className="h-4 w-4 mr-1.5" />
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center data-[state=active]:bg-accent">
                <CalendarRange className="h-4 w-4 mr-1.5" />
                Mês
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar novo item</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendário - agora ocupa mais espaço */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Calendário</CardTitle>
                <CardDescription>
                  Visualize seus eventos e tarefas
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500/60"></span>
                  <span>Eventos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500/60"></span>
                  <span>Tarefas pendentes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500/60"></span>
                  <span>Concluído</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow-sm w-full max-w-none"
              modifiers={{
                event: (date) => events.some((event: Event) => {
                  const eventDate = new Date(event.date);
                  return (
                    eventDate.getDate() === date.getDate() &&
                    eventDate.getMonth() === date.getMonth() &&
                    eventDate.getFullYear() === date.getFullYear()
                  );
                }),
                task: (date) => tasks.some((task: Task) => {
                  if (!task.dueDate) return false;
                  const taskDate = new Date(task.dueDate);
                  return (
                    taskDate.getDate() === date.getDate() &&
                    taskDate.getMonth() === date.getMonth() &&
                    taskDate.getFullYear() === date.getFullYear()
                  );
                }),
                pendingTask: (date) => tasks.some((task: Task) => {
                  if (!task.dueDate) return false;
                  const taskDate = new Date(task.dueDate);
                  return (
                    taskDate.getDate() === date.getDate() &&
                    taskDate.getMonth() === date.getMonth() &&
                    taskDate.getFullYear() === date.getFullYear() &&
                    task.status !== "completed"
                  );
                }),
              }}
              modifiersClassNames={{
                event: "border-b-2 border-purple-500",
                task: "border-t-2 border-primary",
                pendingTask: "border-l-2 border-orange-500"
              }}
              classNames={{
                day_today: "bg-accent text-accent-foreground font-bold border border-primary/40",
                day_selected: "bg-primary text-primary-foreground !opacity-100 font-bold",
                day: "text-sm font-medium focus-visible:bg-accent h-9 w-9 p-0 aria-selected:opacity-100",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-base font-medium",
                nav: "flex items-center gap-1 space-x-1",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell: "w-9 text-sm font-semibold text-muted-foreground rounded-md",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm relative p-0 data-[unavailable=true]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                cell_content: "",
              }}
              components={{
                DayContent: (props) => {
                  const items = getTotalItemsForDate(props.date);
                  return (
                    <div className="relative flex flex-col justify-center items-center h-full w-full">
                      <span className="absolute top-0 left-0 right-0 text-center">{props.date.getDate()}</span>
                      {items.total > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-[2px]">
                          {items.eventCount > 0 && (
                            <div className="w-[6px] h-[6px] rounded-full bg-purple-500"></div>
                          )}
                          {items.taskCount > 0 && (
                            <div className="w-[6px] h-[6px] rounded-full bg-primary"></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>
        
        {/* Lista de eventos e tarefas para o dia selecionado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {selectedDate && formatDate(selectedDate)}
            </CardTitle>
            <CardDescription>
              {getEventsForSelectedDate(selectedDate).length + getTasksForSelectedDate(selectedDate).length === 0 
                ? "Nenhum item neste dia"
                : `${getEventsForSelectedDate(selectedDate).length} eventos, ${getTasksForSelectedDate(selectedDate).length} tarefas`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2"></span>
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
                          className="p-3 rounded-lg bg-card border-l-4 border-l-purple-500 border border-border hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{event.name}</h4>
                            <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
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
                    <span className="w-2.5 h-2.5 rounded-full bg-primary mr-2"></span>
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
                          className={`p-3 rounded-lg border hover:border-primary transition-all hover:shadow-md cursor-pointer ${
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

                <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
                  <Plus className="h-4 w-4" />
                  Adicionar item nesta data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;