import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import DashboardMetrics from "@/components/Dashboard/DashboardMetrics";
import EventCard from "@/components/EventCard";
import TaskList from "@/components/Dashboard/TaskList";
import TipsCard from "@/components/Dashboard/TipsCard";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { formatActivityTimestamp } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const upcomingEvents = data?.upcomingEvents || [];
  const activeEventsList = data?.activeEventsList || [];
  const totalEvents = data?.totalEvents || 0;
  const pendingTasks = data?.pendingTasks || [];
  const recentActivities = data?.recentActivities || [];
  
  // Filter active events (with status planning, confirmed, or in_progress)
  const activeEvents = activeEventsList.filter(event => 
    event.status === 'planning' || 
    event.status === 'confirmed' || 
    event.status === 'in_progress'
  ).length;
  
  // Count events by status
  const planningEvents = activeEventsList.filter(event => event.status === 'planning').length;
  const confirmedEvents = activeEventsList.filter(event => event.status === 'confirmed').length;
  const inProgressEvents = activeEventsList.filter(event => event.status === 'in_progress').length;

  // Determine next upcoming event days
  const upcomingEventDays = React.useMemo(() => {
    if (upcomingEvents.length > 0) {
      const today = new Date();
      const nextEventDate = new Date(upcomingEvents[0].date);
      return Math.ceil((nextEventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }, [upcomingEvents]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 mobile-spacing">
      {/* Header - Otimizado para mobile com design compacto */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 sm:mb-8">
        <div>
          <h1 className="mobile-header hidden sm:block text-2xl md:text-3xl font-bold">
            Seja bem-vindo(a), {user?.firstName || ""}!
          </h1>
          <h2 className="text-xl sm:hidden font-semibold text-foreground">
            Olá, {user?.firstName || ""}!
          </h2>
          {activeEvents > 0 ? (
            <p className="text-muted-foreground mt-1 mobile-text text-sm sm:text-base">
              {isMobile ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <span className="cursor-pointer underline decoration-dotted touch-target inline-flex items-center h-[40px]">
                      <span className="mr-1 text-primary font-medium">{activeEvents}</span>
                      <span>eventos ativos</span>
                    </span>
                  </DialogTrigger>
                  <DialogContent className="w-[90%] max-w-[350px] rounded-xl">
                    <DialogHeader>
                      <DialogTitle>Distribuição dos eventos ativos</DialogTitle>
                    </DialogHeader>
                    <div className="py-3">
                      <div className="space-y-4">
                        {planningEvents > 0 && (
                          <div className="flex items-center touch-target h-[40px]">
                            <span className="mr-3 h-4 w-4 rounded-full bg-[hsl(var(--event-planning))]"></span>
                            <span className="text-base">{planningEvents} em Planejamento</span>
                          </div>
                        )}
                        {confirmedEvents > 0 && (
                          <div className="flex items-center touch-target h-[40px]">
                            <span className="mr-3 h-4 w-4 rounded-full bg-[hsl(var(--event-confirmed))]"></span>
                            <span className="text-base">{confirmedEvents} Confirmado{confirmedEvents > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {inProgressEvents > 0 && (
                          <div className="flex items-center touch-target h-[40px]">
                            <span className="mr-3 h-4 w-4 rounded-full bg-[hsl(var(--event-in-progress))]"></span>
                            <span className="text-base">{inProgressEvents} Em andamento</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer underline decoration-dotted">
                        Você tem {activeEvents} eventos ativos
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" className="p-4 w-[300px] md:w-[320px]">
                      <div className="text-left font-medium mb-2">Distribuição dos eventos ativos:</div>
                      <div className="space-y-2">
                        {planningEvents > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2 h-3 w-3 rounded-full bg-[hsl(var(--event-planning))]"></span>
                            <span className="text-sm whitespace-nowrap">{planningEvents} em Planejamento</span>
                          </div>
                        )}
                        {confirmedEvents > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2 h-3 w-3 rounded-full bg-[hsl(var(--event-confirmed))]"></span>
                            <span className="text-sm whitespace-nowrap">{confirmedEvents} Confirmado{confirmedEvents > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {inProgressEvents > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2 h-3 w-3 rounded-full bg-[hsl(var(--event-in-progress))]"></span>
                            <span className="text-sm whitespace-nowrap">{inProgressEvents} Em andamento</span>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {' '}e {pendingTasks.length} tarefas pendentes.
            </p>
          ) : (
            <p className="text-muted-foreground mt-1 mobile-text text-sm sm:text-base">
              Você não tem eventos ativos no momento. {pendingTasks.length > 0 && `Você tem ${pendingTasks.length} tarefas pendentes.`}
            </p>
          )}
        </div>
        {/* Botão de criar evento removido no mobile, mantido apenas em telas maiores */}
        <div className="mt-3 md:mt-0 hidden sm:block">
          <Link href="/events/new">
            <Button className="gradient-primary w-full sm:w-auto touch-target min-h-[48px] text-sm sm:text-base px-3 sm:px-4">
              <i className="fas fa-plus mr-2"></i> Criar Novo Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <DashboardMetrics 
        totalEvents={totalEvents}
        activeEvents={activeEvents}
        pendingTasks={pendingTasks.length}
        upcomingEvents={upcomingEvents.length}
        upcomingEventDays={upcomingEventDays}
      />

      {/* Card de dicas/recursos com sistema de rotação e interação */}
      <TipsCard 
        isCreatingFirstEvent={totalEvents === 0} 
        hasTeamMembers={activeEventsList.some(event => event.team && event.team.length > 0)} 
        hasVendors={true} // Assumimos que alguns eventos já têm fornecedores
        hasTasks={pendingTasks.length > 0}
      />

      {/* Events Section - Horizontal scroll on mobile - Otimizado */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h2 className="text-base sm:text-xl font-semibold sm:font-bold">Seus Eventos</h2>
          <Link href="/events">
            <div className="text-primary hover:text-primary/80 flex items-center text-xs sm:text-sm font-medium cursor-pointer h-[40px] flex items-center">
              Ver todos
              <i className="fas fa-chevron-right ml-1 sm:ml-2 text-xs"></i>
            </div>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6 sm:py-10">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-10 sm:w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : activeEventsList.length === 0 ? (
          <div className="bg-card rounded-lg p-4 sm:p-8 text-center">
            <div className="mb-2 sm:mb-4 flex justify-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                <i className="fas fa-calendar text-primary text-lg sm:text-2xl"></i>
              </div>
            </div>
            <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Nenhum evento</h3>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-5">Você ainda não tem eventos. Crie seu primeiro evento agora!</p>
            <Link href="/events/new">
              <Button className="gradient-primary h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto">
                <i className="fas fa-plus mr-1 sm:mr-2"></i> Criar Evento
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile carousel view - aprimorado para melhor experiência */}
            <div className="sm:hidden mobile-scroll-container overflow-x-auto pb-1 custom-scrollbar">
              <div className="flex pb-2 w-max">
                {activeEventsList.slice(0, 6).map((event: any) => (
                  <div key={event.id} className="w-[220px] flex-shrink-0 pr-3">
                    <EventCard
                      id={event.id}
                      name={event.name}
                      type={event.type}
                      date={event.date}
                      location={event.location}
                      status={event.status}
                      attendees={event.attendees}
                      team={event.team || []}
                      tasks={event.tasks || []}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tablet and desktop grid view */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeEventsList.slice(0, 3).map((event: any) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  type={event.type}
                  date={event.date}
                  location={event.location}
                  status={event.status}
                  attendees={event.attendees}
                  team={event.team || []}
                  tasks={event.tasks || []}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tasks and Activity Section - Otimizado para mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10">
        {/* Pending Tasks - Versão mobile com scroll horizontal para economizar espaço vertical */}
        <div className="lg:col-span-2 order-1">
          <div className="bg-card rounded-lg shadow-sm p-3 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center">
              <i className="fas fa-tasks text-primary mr-2"></i>
              Tarefas Pendentes
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-8 sm:w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-center py-3 sm:py-6">
                <p className="text-muted-foreground text-xs sm:text-sm">Nenhuma tarefa pendente no momento.</p>
              </div>
            ) : (
              <>
                {/* Mobile scroll view para tarefas */}
                <div className="sm:hidden mobile-scroll-container overflow-x-auto pb-1 custom-scrollbar">
                  <div className="flex pb-2 w-max space-x-2">
                    {pendingTasks.slice(0, 5).map((task: any, index: number) => (
                      <div key={task.id} className="w-[260px] flex-shrink-0 bg-muted/40 p-2 rounded-md">
                        <div className="flex items-start">
                          <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-orange-400' : 
                            'bg-blue-400'
                          }`}></div>
                          <div className="ml-2 flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sem data'}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-sm ${
                                task.status === 'in_progress' ? 'bg-amber-400/10 text-amber-400' :
                                task.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                                'bg-blue-400/10 text-blue-400'
                              }`}>
                                {task.status === 'in_progress' ? 'Em progresso' : 
                                 task.status === 'completed' ? 'Concluída' : 'Pendente'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Desktop view para tarefas */}
                <div className="hidden sm:block">
                  <TaskList 
                    tasks={pendingTasks}
                    loading={false}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Activity Feed - Versão mobile mais compacta */}
        <div className="order-2 mt-3 sm:mt-0">
          <div className="bg-card rounded-lg shadow-sm p-3 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center">
              <i className="far fa-history text-primary mr-2"></i>
              Atividades Recentes
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-8 sm:w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-3 sm:py-6">
                <p className="text-muted-foreground text-xs sm:text-sm">Nenhuma atividade registrada.</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {recentActivities.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-start py-1 sm:py-2 border-b border-border/30 last:border-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <i className={`${
                        // Ícones que não têm versão outline precisam usar a versão solid
                        activity.type === 'task_completed' || 
                        activity.type === 'calendar-plus' ||
                        activity.type === 'user-plus' ? 'fas' : 'far'
                      } fa-${
                        activity.type === 'task_completed' ? 'check' :
                        activity.type === 'event_created' ? 'calendar-plus' :
                        activity.type === 'comment_added' ? 'comment' :
                        activity.type === 'member_added' ? 'user-plus' :
                        'bell'
                      } text-primary text-xs sm:text-sm`}></i>
                    </div>
                    <div className="ml-2 sm:ml-3 flex-1">
                      <p className="text-xs sm:text-sm">
                        <span className="font-medium">{activity.title}</span>
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {activity.eventName}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {formatActivityTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
