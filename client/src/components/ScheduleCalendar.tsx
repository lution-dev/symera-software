import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar as CalendarIcon,
  CalendarRange,
  ClipboardList,
  Loader2
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

interface ScheduleCalendarProps {
  events: Event[];
  tasks: Task[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  onAddItem?: (date: Date) => void;
  isLoading?: boolean;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ 
  events = [], 
  tasks = [], 
  onDateSelect,
  selectedDate,
  onAddItem,
  isLoading = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');

  // Usar useMemo para processamento pesado que só precisa ser recalculado quando as dependências mudam
  const { tasksByDate, eventsByDate } = useMemo(() => {
    // Processar tarefas para um lookup rápido por data
    const taskMap: {[key: string]: Task[]} = {};
    tasks.forEach(task => {
      if (!task.dueDate) return;
      
      const taskDate = new Date(task.dueDate);
      const dateKey = `${taskDate.getFullYear()}-${taskDate.getMonth()}-${taskDate.getDate()}`;
      
      if (!taskMap[dateKey]) {
        taskMap[dateKey] = [];
      }
      
      taskMap[dateKey].push(task);
    });
    
    // Processar eventos para um lookup rápido por data
    const eventMap: {[key: string]: Event[]} = {};
    events.forEach(event => {
      const eventStartDate = event.startDate ? new Date(event.startDate) : new Date(event.date);
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
      
      // Para cada dia no intervalo do evento
      let currentDate = new Date(eventStartDate);
      currentDate.setHours(0, 0, 0, 0);
      
      const endDay = new Date(eventEndDate);
      endDay.setHours(0, 0, 0, 0);
      
      while (currentDate <= endDay) {
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        
        if (!eventMap[dateKey]) {
          eventMap[dateKey] = [];
        }
        
        eventMap[dateKey].push(event);
        
        // Avançar para o próximo dia
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        currentDate = nextDate;
      }
    });
    
    return { 
      tasksByDate: taskMap, 
      eventsByDate: eventMap 
    };
  }, [tasks, events]);

  // Funções para obter eventos e tarefas por data
  const getTasksForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return tasksByDate[dateKey] || [];
  };

  const getEventsForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDate[dateKey] || [];
  };

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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                  <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                    <div className="flex gap-0.5">
                      {hasPendingTask && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                      )}
                      {dayEvents.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Botão de adicionar */}
                {onAddItem && (
                  <button 
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddItem(day);
                    }}
                  >
                    <Plus className="h-3 w-3 text-primary" />
                  </button>
                )}
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
    let formattedDate = '';

    // Loop através de cada semana
    while (day <= endDate) {
      // Loop através de cada dia da semana
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Verificar número de eventos e tarefas para o dia
        const dayEvents = getEventsForDate(day);
        const dayTasks = getTasksForDate(day);
        const hasHighPriorityTask = dayTasks.some(task => task.priority === 'high');
        
        days.push(
          <div
            className={cn(
              "w-full h-24 border p-1 relative",
              !isSameMonth(day, monthStart) ? "text-muted-foreground bg-muted/5" : "",
              isToday(day) ? "bg-primary/5 border-primary/40" : "",
              isSameDay(day, selectedDate) ? "bg-accent/20" : "",
              "hover:bg-accent/10 cursor-pointer"
            )}
            key={day.toString()}
            onClick={() => onDateSelect(cloneDay)}
          >
            {/* Cabeçalho do dia com número e contador de tarefas */}
            <div className="flex justify-between items-start w-full">
              <span
                className={cn(
                  "text-sm font-medium",
                  isToday(day) ? "text-primary" : ""
                )}
              >
                {formattedDate}
              </span>
              
              {(dayEvents.length > 0 || dayTasks.length > 0) && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "h-5 px-1 text-xs",
                    hasHighPriorityTask ? "bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800" : ""
                  )}
                >
                  {dayEvents.length + dayTasks.length}
                </Badge>
              )}
            </div>
            
            {/* Lista de eventos e tarefas - limitado a 3 itens */}
            <div className="mt-1 flex flex-col gap-0.5">
              {dayEvents.slice(0, 1).map((event, idx) => (
                <div
                  key={`event-${idx}`}
                  className="h-4 px-1 text-[0.65rem] rounded truncate bg-primary/70 text-primary-foreground"
                >
                  {event.name}
                </div>
              ))}
              
              {dayTasks.slice(0, hasHighPriorityTask ? 2 : 1).map((task, idx) => {
                // Determinar a cor da tarefa baseada no status e prioridade
                let bgColorClass = task.status === "completed" 
                  ? "bg-green-500/70 text-white" 
                  : task.priority === "high" 
                    ? "bg-red-500/70 text-white" 
                    : task.status === "in_progress" 
                      ? "bg-amber-500/70 text-white" 
                      : "bg-blue-500/70 text-white";
                  
                return (
                  <div
                    key={`task-${idx}`}
                    className={cn(
                      "h-4 px-1 text-[0.65rem] rounded truncate flex items-center",
                      bgColorClass
                    )}
                  >
                    <span className="mr-0.5 text-[0.6rem]">▢</span> {task.title}
                  </div>
                );
              })}
              
              {(dayEvents.length + dayTasks.length) > 2 && (
                <div className="text-[0.65rem] text-muted-foreground pl-1">
                  + {(dayEvents.length + dayTasks.length) - 2} mais
                </div>
              )}
            </div>
            
            {/* Botão de adicionar - só aparece ao passar o mouse */}
            {onAddItem && (
              <button 
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddItem(cloneDay);
                }}
              >
                <Plus className="h-3 w-3 text-primary" />
              </button>
            )}
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
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
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary/70 mb-4" />
          <p className="text-muted-foreground">Carregando eventos e tarefas...</p>
        </div>
      );
    }
    
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

export default ScheduleCalendar;