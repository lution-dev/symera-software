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
  CalendarDays,
  Calendar as CalendarIcon,
  CalendarRange
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

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      // Usar startDate se disponível, caso contrário, usar date
      const eventStartDate = event.startDate ? new Date(event.startDate) : new Date(event.date);
      
      // Usar endDate se disponível, caso contrário, usar a data de início
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
      
      // Converter date para início do dia (00:00:00)
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      // Converter datas do evento para início do dia para comparação correta
      const startDay = new Date(eventStartDate);
      startDay.setHours(0, 0, 0, 0);
      
      const endDay = new Date(eventEndDate);
      endDay.setHours(0, 0, 0, 0);
      
      // Evento está no intervalo se a data verificada estiver entre a data de início e fim (inclusive)
      return checkDate >= startDay && checkDate <= endDay;
    });
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
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
        title = `${format(weekStart, 'd')} - ${format(weekEnd, 'd')} de ${format(weekStart, 'MMMM', { locale: ptBR })}`;
      } else {
        title = `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM', { locale: ptBR })}`;
      }
    } else { // day view
      title = format(currentDate, 'EEEE, d MMMM', { locale: ptBR });
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold capitalize">
            {title}
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de visualização */}
          <div className="bg-muted/20 p-0.5 rounded-md border flex">
            <Button 
              variant={view === 'day' ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setView('day')}
            >
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              Dia
            </Button>
            <Button 
              variant={view === 'week' ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setView('week')}
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Semana
            </Button>
            <Button 
              variant={view === 'month' ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setView('month')}
            >
              <CalendarRange className="h-3.5 w-3.5 mr-1.5" />
              Mês
            </Button>
          </div>
          
          {/* Navegação */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost"
              size="sm"
              className="text-sm h-8"
              onClick={goToToday}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Hoje
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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

  // Renderizar dias da semana para o calendário mensal
  const renderDaysOfWeek = () => {
    const days = [];
    const dateFormat = 'EEEEE';
    let startDate = startOfWeek(new Date(), { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="w-full py-2 text-center" key={i}>
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
        
        // Célula do dia
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[8rem] p-1 relative cursor-pointer transition-colors border-r group",
              !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/5",
              isSameDay(day, selectedDate) && !isToday(day) && "bg-accent/30",
              isToday(day) && "bg-primary/5",
              isSameDay(day, selectedDate) && isToday(day) && "bg-primary/10 font-medium"
            )}
            onClick={() => onDateSelect(cloneDay)}
          >
            {/* Número do dia */}
            <div className="flex justify-between items-start mb-1">
              <div
                className={cn(
                  "flex items-center justify-center h-7 w-7 text-sm",
                  isToday(day) && "bg-primary text-primary-foreground rounded-full font-bold",
                  !isToday(day) && isSameDay(day, selectedDate) && "font-semibold"
                )}
              >
                {formattedDate}
              </div>
              
              {/* Botão de adicionar (visível apenas em hover) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-accent/50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddItem) onAddItem(cloneDay);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {/* Eventos e tarefas */}
            <div className="flex flex-col gap-1 max-h-[calc(100%-1.75rem)] overflow-hidden">
              {/* Primeiro eventos (até 2) */}
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
                
              {/* Depois tarefas (até 2) */}
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
              
              {/* Indicador de mais itens */}
              {totalItems > 3 && (
                <div className="text-xs text-muted-foreground pl-1 mt-0.5">
                  + {totalItems - 3} mais
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