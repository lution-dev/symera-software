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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  
  // Modal para adicionar tarefa rapidamente
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskEventId, setNewTaskEventId] = React.useState<number | null>(null);
  const [newTaskPriority, setNewTaskPriority] = React.useState<"low" | "medium" | "high">("medium");
  
  // Função para exibir o preview do número de itens em um dia
  const renderDayPreview = (date: Date) => {
    const items = getTotalItemsForDate(date);
    if (items.total === 0) return null;
    
    return (
      <div className="text-xs font-medium text-center bg-background/80 backdrop-blur-sm rounded-full border border-border px-1.5 py-0.5 shadow-sm">
        {items.total} {items.total === 1 ? 'item' : 'itens'}
      </div>
    );
  };
  
  return (
    <div className="container max-w-full px-2 sm:px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground mt-1">Organize seus eventos e tarefas no calendário</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="border-primary/40 hover:border-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Hoje
          </Button>
          
          <Tabs 
            defaultValue={activeView} 
            className="bg-background/95 backdrop-blur-sm border rounded-md shadow-sm" 
            onValueChange={(value: string) => setActiveView(value as "day" | "week" | "month")}
          >
            <TabsList className="w-full p-0.5 bg-muted/30">
              <TabsTrigger 
                value="day" 
                className="flex items-center data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
              >
                <CalendarDays className="h-4 w-4 mr-1.5" />
                Dia
              </TabsTrigger>
              <TabsTrigger 
                value="week" 
                className="flex items-center data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
              >
                <CalendarWeek className="h-4 w-4 mr-1.5" />
                Semana
              </TabsTrigger>
              <TabsTrigger 
                value="month" 
                className="flex items-center data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
              >
                <CalendarRange className="h-4 w-4 mr-1.5" />
                Mês
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 border-primary/40 hover:border-primary">
                <Filter className="h-4 w-4" />
                Filtrar
                {(statusFilter || priorityFilter || eventFilter) && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1 text-xs">
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
          
          <Button 
            variant="default" 
            size="sm" 
            className="bg-gradient-to-r from-purple-500 to-primary text-white" 
            onClick={() => setShowAddTaskModal(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Item
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[70vh]">
        {/* Calendário - agora ocupa 80% do espaço disponível */}
        <Card className="lg:col-span-4 shadow-md">
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Calendário</CardTitle>
                <CardDescription>
                  Visualize seus eventos e tarefas
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground border rounded-lg px-3 py-1.5 bg-background/80 backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500/80"></span>
                  <span>Eventos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500/80"></span>
                  <span>Tarefas pendentes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                  <span>Concluído</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md w-full max-w-none shadow-inner bg-background/50"
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
                hasItems: (date) => {
                  const items = getTotalItemsForDate(date);
                  return items.total > 0;
                }
              }}
              modifiersClassNames={{
                event: "border-b-2 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10",
                task: "border-t-2 border-primary hover:bg-primary-50 dark:hover:bg-primary/10",
                pendingTask: "border-l-2 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10",
                hasItems: "cursor-pointer hover:scale-105 transition-transform"
              }}
              classNames={{
                day_today: "bg-accent text-accent-foreground font-bold border border-primary/40 ring-1 ring-primary/30",
                day_selected: "bg-primary text-primary-foreground !opacity-100 font-bold ring-2 ring-primary/40",
                day: "text-sm font-medium h-11 w-11 p-0 aria-selected:opacity-100 hover:bg-muted/50 transition-all duration-200",
                caption: "flex justify-center pt-2 relative items-center",
                caption_label: "text-base font-medium",
                nav: "flex items-center gap-1 space-x-1",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-muted/50 rounded-md transition-all",
                table: "w-full border-collapse space-y-1",
                head_row: "flex mb-2",
                head_cell: "w-11 text-xs font-semibold text-muted-foreground rounded-md uppercase",
                row: "flex w-full mt-1",
                cell: "h-11 w-11 text-center text-sm relative p-0 data-[unavailable=true]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 hover:z-10",
                cell_content: "relative group",
              }}
              components={{
                DayContent: (props) => {
                  const items = getTotalItemsForDate(props.date);
                  
                  return (
                    <div className="relative flex flex-col justify-center items-center h-full w-full group">
                      <span className="relative z-10">{props.date.getDate()}</span>
                      
                      {/* Indicadores de eventos e tarefas */}
                      {items.total > 0 && (
                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-[3px] z-10">
                          {items.eventCount > 0 && (
                            <div className="w-[6px] h-[6px] rounded-full bg-purple-500 shadow-sm"></div>
                          )}
                          {items.taskCount > 0 && (
                            <div className="w-[6px] h-[6px] rounded-full bg-primary shadow-sm"></div>
                          )}
                        </div>
                      )}
                      
                      {/* Preview que aparece no hover */}
                      {items.total > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 group-hover:opacity-100 group-hover:bg-background/90 transition-all duration-200 z-20 rounded-md backdrop-blur-sm">
                          {renderDayPreview(props.date)}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>
        
        {/* Painel lateral - agenda do dia selecionado */}
        <Card className="shadow-md h-full">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
              {selectedDate && formatDate(selectedDate)}
            </CardTitle>
            <CardDescription>
              {getEventsForSelectedDate(selectedDate).length + getTasksForSelectedDate(selectedDate).length === 0 
                ? "Nenhum item neste dia"
                : `${getEventsForSelectedDate(selectedDate).length} eventos, ${getTasksForSelectedDate(selectedDate).length} tarefas`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            {selectedDate && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2"></span>
                    Eventos
                    <Badge variant="outline" className="ml-2 font-medium">
                      {getEventsForSelectedDate(selectedDate).length}
                    </Badge>
                  </h3>
                  
                  {getEventsForSelectedDate(selectedDate).length > 0 ? (
                    <div className="space-y-2.5">
                      {getEventsForSelectedDate(selectedDate).map((event: Event) => (
                        <div 
                          key={event.id} 
                          className="p-3 rounded-md bg-card border-l-4 border-l-purple-500 border shadow-sm hover:border-purple-500 hover:shadow-md transition-all cursor-pointer hover:translate-x-0.5 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-medium text-sm">{event.name}</h4>
                            <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-medium">
                              {event.type}
                            </span>
                          </div>
                          {event.location && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              <span className="inline-block w-1.5 h-1.5 bg-purple-300 rounded-full mr-1.5"></span>
                              {event.location}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-3 text-center">
                      <p className="text-muted-foreground text-sm italic">Nenhum evento neste dia</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary mr-2"></span>
                    Tarefas
                    <Badge variant="outline" className="ml-2 font-medium">
                      {getTasksForSelectedDate(selectedDate).length}
                    </Badge>
                  </h3>
                  
                  {getTasksForSelectedDate(selectedDate).length > 0 ? (
                    <div className="space-y-2.5">
                      {getTasksForSelectedDate(selectedDate).map((task: Task) => (
                        <div 
                          key={task.id} 
                          className={`p-3 rounded-md border shadow-sm hover:border-primary transition-all hover:shadow-md cursor-pointer hover:translate-x-0.5 hover:-translate-y-0.5 ${
                            task.status === "todo" ? "border-l-4 border-l-slate-400" :
                            task.status === "in_progress" ? "border-l-4 border-l-amber-500" :
                            "border-l-4 border-l-green-500"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            {task.status === "todo" ? (
                              <span className="text-slate-400">⭘</span>
                            ) : task.status === "in_progress" ? (
                              <span className="text-amber-500">◔</span>
                            ) : (
                              <span className="text-green-500">✓</span>
                            )}
                            <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              task.priority === "low" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                              task.priority === "medium" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                              "bg-red-500/20 text-red-600 dark:text-red-400"
                            }`}>
                              {task.priority === "low" ? "Baixa" : 
                               task.priority === "medium" ? "Média" : "Alta"}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getTaskStatusColor(task.status)}`}>
                              {getTaskStatusLabel(task.status)}
                            </span>
                          </div>
                          
                          {(task.eventName || task.description) && (
                            <div className="mt-1.5 pt-1.5 border-t border-dashed border-border/50">
                              {task.eventName && (
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <span className="inline-block w-1.5 h-1.5 bg-purple-300 rounded-full mr-1.5"></span>
                                  Evento: {task.eventName}
                                </p>
                              )}
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                                  <span className="inline-block w-1.5 h-1.5 bg-slate-300 rounded-full mr-1.5"></span>
                                  {task.description.length > 40 ? `${task.description.substring(0, 40)}...` : task.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-3 text-center">
                      <p className="text-muted-foreground text-sm italic">Nenhuma tarefa neste dia</p>
                    </div>
                  )}
                </div>

                <Button 
                  variant="default" 
                  className="w-full gap-2 mt-4 bg-gradient-to-r from-purple-500 to-primary text-white shadow-md"
                  onClick={() => setShowAddTaskModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar item nesta data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal para adicionar novo item rapidamente */}
      <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item</DialogTitle>
            <DialogDescription>
              Crie rapidamente uma tarefa ou evento para {selectedDate ? formatDate(selectedDate) : "hoje"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Título</Label>
              <Input 
                id="task-title" 
                placeholder="Ex: Reunião com equipe de marketing" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="type-task" 
                    name="item-type" 
                    className="h-4 w-4 text-primary" 
                    defaultChecked 
                  />
                  <Label htmlFor="type-task" className="font-normal cursor-pointer">Tarefa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="type-event" 
                    name="item-type" 
                    className="h-4 w-4 text-primary" 
                  />
                  <Label htmlFor="type-event" className="font-normal cursor-pointer">Evento</Label>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="task-event">Evento relacionado</Label>
              <select 
                id="task-event" 
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={newTaskEventId || ""}
                onChange={(e) => setNewTaskEventId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Selecione um evento</option>
                {events.map((event: Event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="task-priority">Prioridade</Label>
              <select 
                id="task-priority" 
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowAddTaskModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-500 to-primary text-white"
              onClick={() => {
                toast({
                  title: "Funcionalidade em desenvolvimento",
                  description: "A funcionalidade de adicionar itens estará disponível em breve!",
                });
                setShowAddTaskModal(false);
              }}
            >
              Adicionar Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;