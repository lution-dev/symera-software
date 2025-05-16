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
import { ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface Event {
  id: number;
  name: string;
  date: string;
  type: string;
}

interface Task {
  id: number;
  title: string;
  dueDate?: string;
  status: string;
  priority: string;
}

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
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
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
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost"
            size="sm"
            className="text-sm h-8"
            onClick={() => {
              setCurrentMonth(new Date());
              onDateSelect(new Date());
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Hoje
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Renderizar dias da semana
  const renderDays = () => {
    const days = [];
    const dateFormat = 'E';
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
        
        // Verificar se tem tarefa pendente
        const hasPendingTask = dayTasks.some(task => task.status !== "completed");
        
        // Célula do dia
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[8rem] p-1 relative cursor-pointer transition-colors border-r",
              !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/5",
              isSameDay(day, selectedDate) && !isToday(day) && "bg-accent/30",
              isToday(day) && "bg-primary/5",
              isSameDay(day, selectedDate) && isToday(day) && "bg-primary/10 font-medium"
            )}
            onClick={() => onDateSelect(cloneDay)}
          >
            {/* Número do dia */}
            <div className="flex justify-between items-start mb-1 group">
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
              {/* Exibir até 3 itens entre eventos e tarefas */}
              {[...dayEvents, ...dayTasks]
                .slice(0, 3)
                .map((item, idx) => {
                  // Verificar se é evento ou tarefa
                  const isEvent = 'name' in item;
                  const title = isEvent ? item.name : item.title;
                  
                  // Determinar a cor baseada no tipo
                  let bgColorClass = isEvent 
                    ? "bg-primary/80 text-primary-foreground" 
                    : (item as Task).status === "completed" 
                      ? "bg-green-500/80 text-white" 
                      : (item as Task).priority === "high" 
                        ? "bg-red-500/80 text-white" 
                        : (item as Task).status === "in_progress" 
                          ? "bg-amber-500/80 text-white" 
                          : "bg-blue-500/80 text-white";
                  
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "px-1.5 py-0.5 text-xs font-medium rounded truncate",
                        bgColorClass
                      )}
                    >
                      {title}
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

    return <div className="shadow-sm border rounded-md overflow-hidden">{rows}</div>;
  };

  return (
    <div className="w-full bg-background">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default GoogleStyleCalendar;