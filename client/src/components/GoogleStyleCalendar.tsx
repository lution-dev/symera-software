import React, { useState } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays,
  subDays,
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  isToday,
  eachDayOfInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ArrowLeft,
  ListTodo,
  Calendar as CalendarIcon,
  CalendarRange,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface Event {
  id: number;
  name: string;
  date: string;
  type: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

interface Task {
  id: number;
  title: string;
  dueDate?: string;
  status: string;
  priority: string;
}

type CalendarView = 'day' | 'week' | 'month';

interface GoogleStyleCalendarProps {
  events: Event[];
  tasks: Task[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  onAddItem?: (date: Date) => void;
}

const GoogleStyleCalendar: React.FC<GoogleStyleCalendarProps> = ({ 
  events = [], 
  tasks = [], 
  onDateSelect,
  selectedDate,
  onAddItem
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');

  // Navegação no calendário
  const goToToday = () => {
    setCurrentDate(new Date());
    onDateSelect(new Date());
  };

  const goToPrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  // Usar useMemo para calcular eficientemente os eventos e tarefas por data
  const { eventsByDateMap, tasksByDateMap } = React.useMemo(() => {
    const eventMap: {[key: string]: Event[]} = {};
    const taskMap: {[key: string]: Task[]} = {};
    
    // Processar eventos
    events.forEach(event => {
      const eventStartDate = event.startDate ? new Date(event.startDate) : new Date(event.date);
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
      
      // Para cada dia no intervalo do evento
      let current = new Date(eventStartDate);
      current.setHours(0, 0, 0, 0);
      
      const endDay = new Date(eventEndDate);
      endDay.setHours(0, 0, 0, 0);
      
      while (current <= endDay) {
        const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
        
        if (!eventMap[dateKey]) {
          eventMap[dateKey] = [];
        }
        
        eventMap[dateKey].push(event);
        
        // Avançar para o próximo dia
        const nextDay = new Date(current);
        nextDay.setDate(nextDay.getDate() + 1);
        current = nextDay;
      }
    });
    
    // Processar tarefas
    tasks.forEach(task => {
      if (!task.dueDate) return;
      
      const taskDate = new Date(task.dueDate);
      const dateKey = `${taskDate.getFullYear()}-${taskDate.getMonth()}-${taskDate.getDate()}`;
      
      if (!taskMap[dateKey]) {
        taskMap[dateKey] = [];
      }
      
      taskMap[dateKey].push(task);
    });
    
    return { 
      eventsByDateMap: eventMap, 
      tasksByDateMap: taskMap 
    };
  }, [events, tasks]);

  // Funções otimizadas para obter eventos e tarefas por data
  const getEventsForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDateMap[dateKey] || [];
  };
  
  const getTasksForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return tasksByDateMap[dateKey] || [];
  };

  // Renderizar cabeçalho do calendário
  const renderHeader = () => {
    // Formatar o título de acordo com a visualização
    let title = '';
    if (view === 'month') {
      title = format(currentDate, 'MMMM yyyy', { locale: ptBR });
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        title = `${format(weekStart, 'd')} - ${format(weekEnd, 'd')} ${format(weekStart, 'MMM', { locale: ptBR })}`;
      } else {
        title = `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM', { locale: ptBR })}`;
      }
    } else { // day view
      title = format(currentDate, 'EEE, d MMM', { locale: ptBR });
    }

    return (
      <div className="mb-3 sm:mb-6 px-1">
        {/* Cabeçalho redesenhado para mobile - mais compacto e organizado */}
        <div className="flex items-center justify-between w-full mb-3">
          {/* Título e navegação na mesma linha */}
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center">
              <h2 className="text-sm sm:text-xl font-medium sm:font-bold capitalize leading-tight">
                {title}
              </h2>
            </div>
            
            <Button 
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Botões de ação na direita */}
          <div className="flex items-center gap-1.5">
            <Button 
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={goToToday}
            >
              Hoje
            </Button>
            
            {/* Seletor de visualização integrado na linha principal */}
            <div className="bg-muted/20 rounded-md border flex h-7 overflow-hidden">
              <Button 
                variant={view === 'day' ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 relative",
                  view === 'day' ? "rounded-md" : "rounded-none"
                )}
                onClick={() => setView('day')}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant={view === 'week' ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 relative",
                  view === 'week' ? "rounded-md" : "rounded-none"
                )}
                onClick={() => setView('week')}
              >
                <ClipboardList className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant={view === 'month' ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 relative",
                  view === 'month' ? "rounded-md" : "rounded-none"
                )}
                onClick={() => setView('month')}
              >
                <CalendarRange className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Texto explicativo da visualização - apenas em desktop */}
        <div className="hidden sm:block text-xs text-muted-foreground mb-2">
          {view === 'day' ? 'Visualização diária' : 
           view === 'week' ? 'Visualização semanal' : 'Visualização mensal'}
        </div>
      </div>
    );
  };

  // Renderização para a visualização de dia
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="shadow-sm border rounded-md overflow-hidden">
        <div className="text-center py-3 border-b bg-accent/10">
          <div className="text-sm font-medium">
            {format(currentDate, 'EEEE', { locale: ptBR })}
          </div>
          <div className={cn(
            "mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium",
            isToday(currentDate) ? "bg-primary text-primary-foreground" : ""
          )}>
            {format(currentDate, 'd')}
          </div>
        </div>
        
        <div className="grid grid-cols-[4rem_1fr]">
          {/* Coluna de horas */}
          <div className="border-r">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b px-2 text-right text-xs text-muted-foreground pt-1">
                {hour}:00
              </div>
            ))}
          </div>
          
          {/* Coluna de eventos */}
          <div>
            {hours.map(hour => {
              const hourDate = new Date(currentDate);
              hourDate.setHours(hour, 0, 0, 0);
              
              // Filtrar eventos e tarefas desta hora
              const dayEvents = getEventsForDate(currentDate).filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getHours() === hour;
              });
              
              const dayTasks = getTasksForDate(currentDate).filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return taskDate.getHours() === hour;
              });
              
              const totalItems = [...dayEvents, ...dayTasks];
              
              return (
                <div 
                  key={hour}
                  className="h-16 border-b hover:bg-accent/10 relative"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setHours(hour, 0, 0, 0);
                    onDateSelect(newDate);
                  }}
                >
                  {totalItems.length > 0 ? (
                    <div className="px-2 py-1 absolute inset-0">
                      {totalItems.map((item, idx) => {
                        const isEvent = 'name' in item;
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "mb-1 px-2 py-1 text-xs rounded truncate cursor-pointer",
                              isEvent 
                                ? "bg-primary/80 text-primary-foreground" 
                                : (item as Task).status === "completed" 
                                  ? "bg-green-500/80 text-white" 
                                  : (item as Task).priority === "high" 
                                    ? "bg-red-500/80 text-white" 
                                    : (item as Task).status === "in_progress" 
                                      ? "bg-amber-500/80 text-white" 
                                      : "bg-blue-500/80 text-white"
                            )}
                          >
                            {isEvent ? (item as Event).name : (item as Task).title}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Renderização para a visualização de semana
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return (
      <div className="shadow-sm border rounded-md overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day, idx) => (
            <div 
              key={idx}
              className={cn(
                "py-2 text-center",
                isToday(day) ? "bg-primary/5" : "",
                isSameDay(day, selectedDate) ? "bg-accent/20" : ""
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">
                {format(day, 'EEEE', { locale: ptBR })}
              </div>
              <div className={cn(
                "flex items-center justify-center mx-auto w-8 h-8 rounded-full",
                isToday(day) ? "bg-primary text-primary-foreground" : "",
                !isToday(day) && isSameDay(day, selectedDate) ? "font-bold" : ""
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        {/* Conteúdo dos dias */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            const dayTasks = getTasksForDate(day);
            const totalItems = [...dayEvents, ...dayTasks];
            const hasPendingTask = dayTasks.some(task => task.status !== "completed");
            
            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[32rem] border-r p-1 relative cursor-pointer hover:bg-accent/5",
                  isToday(day) ? "bg-primary/5" : "",
                  isSameDay(day, selectedDate) ? "bg-accent/20" : "",
                  !isSameMonth(day, currentDate) ? "text-muted-foreground bg-muted/10" : ""
                )}
                onClick={() => onDateSelect(day)}
              >
                {/* Eventos e tarefas */}
                <div className="mt-2 flex flex-col gap-1">
                  {/* Primeiro exibir eventos */}
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={`event-${idx}`}
                      className="px-2 py-1 text-xs rounded truncate bg-primary/80 text-primary-foreground"
                    >
                      {event.name}
                    </div>
                  ))}
                  
                  {/* Depois exibir tarefas */}
                  {dayTasks.slice(0, 3).map((task, idx) => {
                    // Determinar a cor da tarefa baseada no status e prioridade
                    let bgColorClass = task.status === "completed" 
                      ? "bg-green-500/80 text-white" 
                      : task.priority === "high" 
                        ? "bg-red-500/80 text-white" 
                        : task.status === "in_progress" 
                          ? "bg-amber-500/80 text-white" 
                          : "bg-blue-500/80 text-white";
                      
                    return (
                      <div
                        key={`task-${idx}`}
                        className={cn(
                          "px-2 py-1 text-xs rounded truncate flex items-center",
                          bgColorClass
                        )}
                      >
                        <span className="mr-1">▢</span> {task.title}
                      </div>
                    );
                  })}
                  
                  {totalItems.length > 6 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      + {totalItems.length - 6} mais
                    </div>
                  )}
                </div>
                
                {/* Indicadores na parte inferior */}
                {totalItems.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5">
                    {dayEvents.length > 0 && (
                      <Badge variant="outline" className="bg-primary h-1 w-1/3 p-0 rounded-full border-none" />
                    )}
                    {hasPendingTask && (
                      <Badge variant="outline" className="bg-amber-500 h-1 w-1/3 p-0 rounded-full border-none" />
                    )}
                    {dayTasks.some(task => task.status === "completed") && (
                      <Badge variant="outline" className="bg-green-500 h-1 w-1/3 p-0 rounded-full border-none" />
                    )}
                  </div>
                )}
                
                {/* Botão adicionar */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute top-1 right-1 opacity-0 hover:opacity-100 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddItem) onAddItem(day);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar dias da semana para o calendário mensal - Otimizado para mobile
  const renderDaysOfWeek = () => {
    const days = [];
    // Usar formato mais curto para mobile
    const dateFormat = 'EEEEE';
    let startDate = startOfWeek(new Date(), { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="w-full py-1 sm:py-2 text-center" key={i}>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {format(addDays(startDate, i), dateFormat, { locale: ptBR })}
          </div>
        </div>
      );
    }

    return <div className="grid grid-cols-7 border-b">{days}</div>;
  };

  // Renderizar células do calendário para visualização de mês
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Criar todas as células do calendário
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = new Date(day);
        const dayEvents = getEventsForDate(day);
        const dayTasks = getTasksForDate(day);
        const totalItems = dayEvents.length + dayTasks.length;
        
        // Verificar se tem tarefa pendente
        const hasPendingTask = dayTasks.some(task => task.status !== "completed");
        
        // Célula do dia - altura reduzida no mobile
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[4.5rem] sm:min-h-[8rem] p-1 relative cursor-pointer transition-colors border-r group",
              !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/5",
              isSameDay(day, selectedDate) && !isToday(day) && "bg-accent/30",
              isToday(day) && "bg-primary/5",
              isSameDay(day, selectedDate) && isToday(day) && "bg-primary/10 font-medium"
            )}
            onClick={() => onDateSelect(cloneDay)}
          >
            {/* Número do dia - menor no mobile */}
            <div className="flex justify-between items-start mb-0.5 sm:mb-1">
              <div
                className={cn(
                  "flex items-center justify-center text-xs sm:text-sm",
                  "h-5 w-5 sm:h-7 sm:w-7",
                  isToday(day) && "bg-primary text-primary-foreground rounded-full font-bold",
                  !isToday(day) && isSameDay(day, selectedDate) && "font-semibold"
                )}
              >
                {formattedDate}
              </div>
              
              {/* Botão de adicionar (apenas em desktop) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 sm:h-6 sm:w-6 hidden sm:inline-flex opacity-0 group-hover:opacity-100 hover:bg-accent/50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddItem) onAddItem(cloneDay);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Eventos e tarefas */}
            <div className="flex flex-col gap-0.5 sm:gap-1 max-h-[calc(100%-1.5rem)] overflow-hidden">
              {/* Eventos - exibição diferente para mobile e desktop */}
              <div className="hidden sm:block">
                {dayEvents
                  .slice(0, 2)
                  .map((event, idx) => (
                    <div 
                      key={`event-${idx}`}
                      className="px-1.5 py-0.5 text-xs font-medium rounded truncate bg-primary/80 text-primary-foreground"
                    >
                      {event.name}
                    </div>
                  ))}
                  
                {/* Tarefas em desktop */}
                {dayTasks
                  .slice(0, 2)
                  .map((task, idx) => {
                    // Determinar a cor da tarefa baseada no status e prioridade
                    let bgColorClass = task.status === "completed" 
                      ? "bg-green-500/80 text-white" 
                      : task.priority === "high" 
                        ? "bg-red-500/80 text-white" 
                        : task.status === "in_progress" 
                          ? "bg-amber-500/80 text-white" 
                          : "bg-blue-500/80 text-white";
                    
                    return (
                      <div 
                        key={`task-${idx}`}
                        className={cn(
                          "px-1.5 py-0.5 text-xs font-medium rounded truncate flex items-center",
                          bgColorClass
                        )}
                      >
                        <span className="mr-1">▢</span> {task.title}
                      </div>
                    );
                  })}
              </div>
              
              {/* Mobile: versão compacta com pontos indicadores */}
              <div className="sm:hidden flex flex-col gap-0.5">
                {dayEvents.slice(0, 1).map((event, idx) => (
                  <div 
                    key={`event-m-${idx}`}
                    className="h-1.5 rounded-full bg-primary/80"
                  />
                ))}
                
                {dayTasks.slice(0, 1).map((task, idx) => {
                  let bgColorClass = task.status === "completed" 
                    ? "bg-green-500/80" 
                    : task.priority === "high" 
                      ? "bg-red-500/80" 
                      : "bg-blue-500/80";
                  
                  return (
                    <div 
                      key={`task-m-${idx}`}
                      className={cn("h-1.5 rounded-full", bgColorClass)}
                    />
                  );
                })}
              </div>
              
              {/* Indicador de mais itens - adaptado para mobile */}
              {totalItems > 2 && (
                <div className={cn(
                  "text-muted-foreground mt-0.5",
                  "text-[0.6rem] sm:text-xs"
                )}>
                  +{totalItems - 2}
                </div>
              )}
            </div>
            
            {/* Indicadores na parte inferior */}
            {totalItems > 0 && (
              <div className="absolute bottom-1 left-1 right-1 flex gap-0.5">
                {dayEvents.length > 0 && (
                  <Badge variant="outline" className="bg-primary h-1 w-1/3 p-0 rounded-full border-none" />
                )}
                {hasPendingTask && (
                  <Badge variant="outline" className="bg-amber-500 h-1 w-1/3 p-0 rounded-full border-none" />
                )}
                {dayTasks.some(task => task.status === "completed") && (
                  <Badge variant="outline" className="bg-green-500 h-1 w-1/3 p-0 rounded-full border-none" />
                )}
              </div>
            )}
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={`row-${day}`} className="grid grid-cols-7 border-b">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="shadow-sm border rounded-md overflow-hidden">
        {renderDaysOfWeek()}
        <div>{rows}</div>
      </div>
    );
  };

  // Escolher a visualização correta
  const renderCalendarView = () => {
    switch(view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
      default:
        return renderMonthView();
    }
  };

  return (
    <div className="w-full">
      {renderHeader()}
      {renderCalendarView()}
    </div>
  );
};

export default GoogleStyleCalendar;