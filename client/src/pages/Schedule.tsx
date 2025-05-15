import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, ListTodo, Filter } from "lucide-react";

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
    
    return tasks.filter((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  const getEventsForSelectedDate = (date: Date) => {
    if (!events.length) return [];
    
    return events.filter((event: Event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Função para destacar datas no calendário com eventos ou tarefas
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
    
    if (hasEvent && hasTask) return "bg-primary/20 rounded-full";
    if (hasEvent) return "bg-purple-500/20 rounded-full";
    if (hasTask) return "bg-orange-500/20 rounded-full";
    
    return "";
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cronograma</h1>
        <div className="flex space-x-2">
          <Tabs defaultValue={activeView} onValueChange={(value: string) => setActiveView(value as "day" | "week" | "month")}>
            <TabsList>
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Calendário</CardTitle>
            <CardDescription>
              Visualize seus eventos e tarefas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
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
                })
              }}
              modifiersClassNames={{
                event: "bg-purple-500/20 rounded-full",
                task: "border-2 border-primary"
              }}
              classNames={{
                day_today: "bg-accent text-accent-foreground",
                day_selected: "bg-primary text-primary-foreground !opacity-100",
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
              Eventos e tarefas para este dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Eventos</h3>
                  {getEventsForSelectedDate(selectedDate).length > 0 ? (
                    <div className="space-y-2">
                      {getEventsForSelectedDate(selectedDate).map((event: Event) => (
                        <div 
                          key={event.id} 
                          className="p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors cursor-pointer"
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
                    <p className="text-muted-foreground text-sm">Nenhum evento neste dia</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tarefas</h3>
                  {getTasksForSelectedDate(selectedDate).length > 0 ? (
                    <div className="space-y-2">
                      {getTasksForSelectedDate(selectedDate).map((task: Task) => (
                        <div 
                          key={task.id} 
                          className={`p-3 rounded-lg border hover:border-primary transition-colors cursor-pointer ${
                            task.status === "todo" ? "bg-card border-border" :
                            task.status === "in_progress" ? "bg-amber-500/10 border-amber-500/50" :
                            "bg-green-500/10 border-green-500/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{task.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.priority === "low" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                              task.priority === "medium" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                              "bg-red-500/20 text-red-600 dark:text-red-400"
                            }`}>
                              {task.priority === "low" ? "Baixa" : 
                               task.priority === "medium" ? "Média" : "Alta"}
                            </span>
                          </div>
                          {task.eventName && (
                            <p className="text-sm text-muted-foreground">
                              Evento: {task.eventName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhuma tarefa neste dia</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;