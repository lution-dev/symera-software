import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import DashboardMetrics from "@/components/Dashboard/DashboardMetrics";
import EventCard from "@/components/EventCard";
import TaskList from "@/components/Dashboard/TaskList";
import TipsCard from "@/components/Dashboard/TipsCard";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { formatActivityTimestamp } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Utility function to calculate days remaining consistently
const calculateDaysRemaining = (eventDate: string) => {
  const targetDate = new Date(eventDate);
  const today = new Date();
  
  // Reset both dates to midnight UTC to ensure accurate day calculation
  today.setUTCHours(0, 0, 0, 0);
  targetDate.setUTCHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
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
  const migrationAttempted = useRef(false);
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const migrationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/force-migration', { method: 'POST' });
    },
    onSuccess: (result) => {
      console.log("Migração executada:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      console.error("Erro na migração:", error);
    }
  });

  useEffect(() => {
    if (!isLoading && data && !migrationAttempted.current) {
      const totalEvents = data?.totalEvents || 0;
      if (totalEvents === 0 && user) {
        console.log("Nenhum evento encontrado, tentando migração automática...");
        migrationAttempted.current = true;
        migrationMutation.mutate();
      }
    }
  }, [isLoading, data, user]);

  const upcomingEvents = data?.upcomingEvents || [];
  const activeEventsList = React.useMemo(() => {
    const events = data?.activeEventsList || [];
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    return [...events]
      .sort((a, b) => {
        const dateA = new Date(a.startDate || a.start_date || "2099-12-31");
        const dateB = new Date(b.startDate || b.start_date || "2099-12-31");
        return dateA.getTime() - dateB.getTime();
      })
      .filter(event => {
        const eventDate = new Date(event.startDate || event.start_date || "2099-12-31");
        return eventDate >= now;
      });
  }, [data?.activeEventsList]);
  
  const allActiveEventsList = data?.activeEventsList || [];
  
  const totalEvents = data?.totalEvents || 0;
  const pendingTasks = data?.pendingTasks || [];
  const recentActivities = data?.recentActivities || [];
  
  // Filter active events (with status planning, confirmed, or in_progress)
  const activeEvents = allActiveEventsList.filter(event => 
    event.status === 'planning' || 
    event.status === 'confirmed' || 
    event.status === 'in_progress'
  ).length;
  
  // Count events by status
  const planningEvents = allActiveEventsList.filter(event => event.status === 'planning').length;
  const confirmedEvents = allActiveEventsList.filter(event => event.status === 'confirmed').length;
  const inProgressEvents = allActiveEventsList.filter(event => event.status === 'in_progress').length;

  // Determine next upcoming event days
  const upcomingEventDays = React.useMemo(() => {
    if (upcomingEvents.length > 0) {
      return calculateDaysRemaining(upcomingEvents[0].startDate || upcomingEvents[0].start_date || upcomingEvents[0].date);
    }
    if (activeEventsList.length > 0) {
      return calculateDaysRemaining(activeEventsList[0].startDate || activeEventsList[0].start_date || activeEventsList[0].date);
    }
    return 0;
  }, [upcomingEvents, activeEventsList]);

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
            <div className="text-muted-foreground mt-1 mobile-text text-sm sm:text-base">
              {isMobile ? (
                <>
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
                  <span>{' '}e {pendingTasks.length} tarefas pendentes.</span>
                </>
              ) : (
                <>
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
                  <span>{' '}e {pendingTasks.length} tarefas pendentes.</span>
                </>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground mt-1 mobile-text text-sm sm:text-base">
              Você não tem eventos ativos no momento. {pendingTasks.length > 0 && `Você tem ${pendingTasks.length} tarefas pendentes.`}
              {totalEvents === 0 && (
                <Button 
                  variant="link" 
                  className="text-primary p-0 h-auto ml-2"
                  onClick={() => migrationMutation.mutate()}
                  disabled={migrationMutation.isPending}
                >
                  {migrationMutation.isPending ? "Recuperando..." : "Recuperar eventos anteriores"}
                </Button>
              )}
            </div>
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

      {/* Quick Access Buttons - Only visible on mobile screens */}
      <div className="mt-4 mb-4 sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          <Link href="/vendors" className="block">
            <div className="bg-[#1f1730] border border-primary/30 rounded-xl p-3 flex flex-col items-center justify-center h-[70px] text-center">
              <div className="text-primary mb-1">
                <i className="fas fa-store text-lg"></i>
              </div>
              <span className="text-xs font-medium text-white">Fornecedores</span>
            </div>
          </Link>
          <Link href="/budget" className="block">
            <div className="bg-[#1f1730] border border-primary/30 rounded-xl p-3 flex flex-col items-center justify-center h-[70px] text-center">
              <div className="text-primary mb-1">
                <i className="fas fa-dollar-sign text-lg"></i>
              </div>
              <span className="text-xs font-medium text-white">Orçamento</span>
            </div>
          </Link>
          <Link href="/team" className="block">
            <div className="bg-[#1f1730] border border-primary/30 rounded-xl p-3 flex flex-col items-center justify-center h-[70px] text-center">
              <div className="text-primary mb-1">
                <i className="fas fa-users text-lg"></i>
              </div>
              <span className="text-xs font-medium text-white">Equipe</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Card de dicas/recursos com sistema de rotação e interação */}
      <TipsCard 
        isCreatingFirstEvent={totalEvents === 0} 
        hasTeamMembers={allActiveEventsList.some(event => event.team && event.team.length > 0)} 
        hasVendors={true} // Assumimos que alguns eventos já têm fornecedores
        hasTasks={pendingTasks.length > 0}
      />

      {/* Events Section - Horizontal scroll on mobile - Otimizado */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h2 className="text-base sm:text-xl font-semibold sm:font-bold">Próximos Eventos</h2>
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
                      format={event.format}
                      startDate={event.startDate || event.start_date}
                      endDate={event.endDate || event.end_date}
                      startTime={event.startTime || event.start_time || "19:00"}
                      endTime={event.endTime || event.end_time || "23:00"}
                      location={event.location}
                      status={event.status}
                      attendees={event.attendees}
                      team={event.team || []}
                      tasks={event.tasks || []}
                      coverImage={event.coverImageUrl || event.cover_image_url}
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
                  format={event.format}
                  startDate={event.startDate || event.start_date}
                  endDate={event.endDate || event.end_date}
                  startTime={event.startTime || event.start_time || "19:00"}
                  endTime={event.endTime || event.end_time || "23:00"}
                  location={event.location}
                  status={event.status}
                  attendees={event.attendees}
                  team={event.team || []}
                  tasks={event.tasks || []}
                  coverImage={event.coverImageUrl || event.cover_image_url}
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
          <div>
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
                {/* Mobile task list component */}
                <div className="sm:hidden">
                  <TaskList 
                    title="📝 Minhas Tarefas"
                    tasks={pendingTasks}
                    loading={false}
                    showEventName={true}
                    limitTasks={true}
                    showFilters={true}
                  />
                </div>
                
                {/* Desktop view para tarefas */}
                <div className="hidden sm:block">
                  <TaskList 
                    title="📝 Minhas Tarefas"
                    tasks={pendingTasks}
                    loading={false}
                    showEventName={true}
                    limitTasks={true}
                    showFilters={true}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Timeline de Atividades Recentes */}
        <div className="order-2 mt-3 sm:mt-0">
          <div className="rounded-lg p-3 sm:p-5 bg-card border shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 flex items-center">
              <i className="fas fa-history text-primary mr-2"></i>
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
              <div className="relative pb-2">
                {/* Texto informativo sobre as 5 atividades mais recentes */}
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-4 text-center">
                  Exibindo suas 5 atividades mais recentes
                </p>
                
                {/* Linha de tempo vertical */}
                <div className="absolute left-3.5 sm:left-4 top-2 bottom-0 w-0.5 bg-border/50 z-0"></div>
                
                {recentActivities.slice(0, 5).map((activity: any, index: number) => {
                  // Determinar o texto de cada atividade com base no tipo de ação
                  const getActivityText = () => {
                    const { action, details } = activity;
                    
                    switch (action) {
                      case "created_event":
                        return `Criou o evento "${details?.eventName || 'Evento'}"`;
                      case "event_created":
                        return `Criou o evento "${details?.eventName || 'Evento'}"`;
                      case "updated_event":
                        return `Atualizou o evento "${details?.eventName || 'Evento'}"`;
                      case "created_task":
                      case "task_added":
                        return `Adicionou a tarefa "${details?.taskTitle || 'Tarefa'}"`;
                      case "updated_task":
                        return `Atualizou a tarefa "${details?.taskTitle || 'Tarefa'}"`;
                      case "task_completed":
                        return `Concluiu a tarefa "${details?.taskTitle || 'Tarefa'}"`;
                      case "added_team_member":
                      case "team_member_added":
                        return `Adicionou ${details?.memberName || details?.memberEmail || 'membro'} à equipe`;
                      case "vendor_added":
                        return `Adicionou fornecedor ${details?.vendorName || 'novo'} (${details?.service || 'serviço'})`;
                      case "vendor_updated":
                        return `Atualizou fornecedor ${details?.vendorName || 'existente'}`;
                      case "status_updated":
                        return `Alterou status de "${details?.oldStatus || 'anterior'}" para "${details?.newStatus || 'novo'}"`;
                      case "generated_ai_checklist":
                        return `Gerou checklist com IA`;
                      default:
                        return "Realizou uma ação";
                    }
                  };
                  
                  // Pegar o nome do evento da API ou dos detalhes
                  const eventName = allActiveEventsList.find(e => e.id === activity.eventId)?.name || activity.details?.eventName || '';
                  
                  // Determinar cor do ícone e bolinha com base no tipo de ação
                  const getActivityColorClass = () => {
                    switch (activity.action) {
                      case "created_event":
                      case "event_created":
                        return "bg-green-500/10 text-green-500 border-green-500/50";
                      case "task_completed":
                        return "bg-blue-500/10 text-blue-500 border-blue-500/50";
                      case "added_team_member":
                      case "team_member_added":
                        return "bg-purple-500/10 text-purple-500 border-purple-500/50";
                      case "vendor_added":
                        return "bg-amber-500/10 text-amber-500 border-amber-500/50";
                      case "generated_ai_checklist":
                        return "bg-teal-500/10 text-teal-500 border-teal-500/50";
                      default:
                        return "bg-primary/10 text-primary border-primary/50";
                    }
                  };
                  
                  // Ícones usando classes do Font Awesome padrão
                  const getActivityIconClass = () => {
                    switch (activity.action) {
                      case "created_event":
                      case "event_created":
                        return "fas fa-calendar-plus";
                      case "updated_event":
                        return "fas fa-calendar-check";
                      case "created_task":
                      case "task_added":
                        return "fas fa-tasks";
                      case "updated_task":
                        return "fas fa-edit";
                      case "task_completed":
                        return "fas fa-check";
                      case "added_team_member":
                      case "team_member_added":
                        return "fas fa-user-plus";
                      case "vendor_added":
                        return "fas fa-store";
                      case "vendor_updated":
                        return "fas fa-edit";
                      case "status_updated":
                        return "fas fa-sync";
                      case "generated_ai_checklist":
                        return "fas fa-robot";
                      default:
                        return "fas fa-bell";
                    }
                  };
                  
                  return (
                    <div key={activity.id} className="relative mb-4 last:mb-0 pl-10 sm:pl-12">
                      {/* Nó na timeline */}
                      <div className={`absolute left-0 top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border ${getActivityColorClass()} flex items-center justify-center flex-shrink-0 z-10`}>
                        <i className={`${getActivityIconClass()} text-xs sm:text-sm`}></i>
                      </div>
                      
                      {/* Conteúdo da atividade */}
                      <div className={`p-2 sm:p-3 rounded-lg border ${index === 0 ? 'border-primary/20 bg-primary/5' : 'border-border/30 bg-muted/30'}`}>
                        <p className="text-xs sm:text-sm font-medium">
                          {getActivityText()}
                        </p>
                        
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center">
                            <i className="fas fa-folder-open text-[8px] sm:text-[10px] mr-1"></i>
                            {eventName}
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center">
                            <i className="fas fa-clock text-[8px] sm:text-[10px] mr-1"></i>
                            {formatActivityTimestamp(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
