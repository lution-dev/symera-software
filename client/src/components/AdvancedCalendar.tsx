import React, { useState } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays,
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface AdvancedCalendarProps {
  events: Event[];
  tasks: Task[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  onAddItem?: (date: Date) => void;
}

const AdvancedCalendar: React.FC<AdvancedCalendarProps> = ({ 
  events = [], 
  tasks = [], 
  onDateSelect,
  selectedDate,
  onAddItem
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
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
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => {
              setCurrentMonth(new Date());
              onDateSelect(new Date());
            }}
          >
            Hoje
          </Button>
        </div>
      </div>
    );
  };

  // Renderizar dias da semana
  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEEE';
    let startDate = startOfWeek(new Date(), { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="w-full font-bold" key={i}>
          {format(addDays(startDate, i), dateFormat, { locale: ptBR }).toUpperCase()}
        </div>
      );
    }

    return <div className="grid grid-cols-7 text-center py-2 text-xs border-b">{days}</div>;
  };

  // Renderizar células do calendário
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
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
        
        // Verificar se tem evento pendente
        const hasPendingTask = dayTasks.some(task => task.status !== "completed");
        
        // Célula do dia
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "h-24 sm:h-32 border-r border-b p-1 relative cursor-pointer hover:bg-accent/20 transition-colors",
              !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/10",
              isSameDay(day, selectedDate) && "bg-accent/20 border border-primary/50",
              isToday(day) && "bg-primary/5"
            )}
            onClick={() => onDateSelect(cloneDay)}
          >
            {/* Número do dia */}
            <div className="flex justify-between items-start mb-1">
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 text-sm rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground font-bold",
                  !isToday(day) && isSameDay(day, selectedDate) && "font-semibold"
                )}
              >
                {formattedDate}
              </div>
              
              {/* Botão de adicionar (visível apenas em hover) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 hover:opacity-100 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddItem) onAddItem(cloneDay);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Indicadores de eventos/tarefas */}
            {totalItems > 0 && (
              <div className="flex flex-col gap-1 max-h-[calc(100%-28px)] overflow-hidden">
                {/* Exibir primeiros 2 eventos */}
                {dayEvents.slice(0, 2).map((event, idx) => (
                  <div 
                    key={`event-${idx}`}
                    className="bg-primary/80 text-primary-foreground text-xs rounded px-1.5 py-0.5 truncate"
                  >
                    {event.name}
                  </div>
                ))}
                
                {/* Exibir primeiras 2 tarefas */}
                {dayTasks.slice(0, 2).map((task, idx) => (
                  <div 
                    key={`task-${idx}`}
                    className={cn(
                      "text-xs rounded px-1.5 py-0.5 truncate",
                      task.status === "completed" ? "bg-green-500/80 text-white" :
                      task.priority === "high" ? "bg-red-500/80 text-white" :
                      task.status === "in_progress" ? "bg-amber-500/80 text-white" :
                      "bg-blue-500/80 text-white"
                    )}
                  >
                    {task.title}
                  </div>
                ))}
                
                {/* Indicador de mais itens */}
                {totalItems > 4 && (
                  <div className="text-xs text-muted-foreground pl-1">
                    +{totalItems - 4} mais
                  </div>
                )}
              </div>
            )}
            
            {/* Indicadores coloridos */}
            {totalItems > 0 && (
              <div className="absolute bottom-1 left-1 right-1 flex gap-0.5">
                {dayEvents.length > 0 && (
                  <div className="h-1 bg-primary rounded-full flex-1"></div>
                )}
                {hasPendingTask && (
                  <div className="h-1 bg-amber-500 rounded-full flex-1"></div>
                )}
                {dayTasks.some(task => task.status === "completed") && (
                  <div className="h-1 bg-green-500 rounded-full flex-1"></div>
                )}
              </div>
            )}
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={`row-${day}`} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="w-full bg-background">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default AdvancedCalendar;