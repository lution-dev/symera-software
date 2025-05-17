import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import DashboardMetrics from "@/components/Dashboard/DashboardMetrics";
import EventCard from "@/components/EventCard";
import TaskList from "@/components/Dashboard/TaskList";
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
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Seja bem-vindo(a), {user?.firstName || ""}!
          </h1>
          {activeEvents > 0 ? (
            <p className="text-muted-foreground mt-1">
              {isMobile ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <span className="cursor-pointer underline decoration-dotted">
                      Você tem {activeEvents} eventos ativos
                    </span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Distribuição dos eventos ativos</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        {planningEvents > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2 h-3 w-3 rounded-full bg-[hsl(var(--event-planning))]"></span>
                            <span className="text-sm">{planningEvents} em Planejamento</span>
                          </div>
                        )}
                        {confirmedEvents > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2 h-3 w-3 rounded-full bg-[hsl(var(--event-confirmed))]"></span>
                            <span className="text-sm">{confirmedEvents} Confirmado{confirmedEvents > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {inProgressEvents > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2 h-3 w-3 rounded-full bg-[hsl(var(--event-in-progress))]"></span>
                            <span className="text-sm">{inProgressEvents} Em andamento</span>
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
            <p className="text-muted-foreground mt-1">
              Você não tem eventos ativos no momento. {pendingTasks.length > 0 && `Você tem ${pendingTasks.length} tarefas pendentes.`}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/events/new">
            <Button className="gradient-primary">
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

      {/* Create Event Banner */}
      <div className="mb-8 bg-card rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Crie seu próximo evento com inteligência</h2>
          <p className="text-muted-foreground mb-4 max-w-xl">
            Use nosso checklist inteligente com IA para organizar qualquer tipo de evento 
            de forma profissional, sem esquecer nenhum detalhe.
          </p>
          <Link href="/events/new">
            <Button className="gradient-primary">
              <i className="fas fa-plus mr-2"></i> Criar Novo Evento
            </Button>
          </Link>
        </div>
        {/* Abstract decoration */}
        <div className="absolute top-0 right-0 w-64 h-full opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor"
              className="text-primary"
              d="M47.1,-61.5C60.9,-52.7,71.8,-38.6,76.3,-22.7C80.8,-6.9,78.8,10.6,71.8,25.4C64.9,40.2,52.9,52.3,38.9,59.4C24.8,66.5,8.7,68.6,-7.2,67.3C-23.1,66,-38.8,61.3,-50.8,51.5C-62.8,41.7,-71.1,26.7,-74.9,10.1C-78.7,-6.5,-78,-24.8,-68.9,-38C-59.9,-51.3,-42.5,-59.4,-26.6,-67C-10.7,-74.6,3.6,-81.6,18.7,-79.5C33.8,-77.4,47.1,-70.8,61.3,-61.8C75.4,-52.7,89.3,-41.4,92.8,-28.5C96.4,-15.5,89.6,-0.9,84.2,14.9C78.8,30.8,74.7,47.8,64.1,59.5C53.6,71.3,36.6,77.8,19.8,77.7C3.1,77.7,-13.3,71.1,-28.5,64C-43.8,56.9,-57.8,49.2,-68.4,37.8C-79,26.4,-86.1,11.3,-86.5,-3.9C-86.8,-19.1,-80.4,-34.6,-69.2,-44.4C-58,-54.2,-41.9,-58.3,-27.6,-66.4C-13.3,-74.5,-0.7,-86.5,8.8,-84.9C18.3,-83.2,24.5,-68,37.6,-60.3C50.6,-52.7,70.4,-52.5,82.9,-44.3C95.3,-36,100.4,-19.5,98.1,-4.6C95.8,10.3,86.1,23.9,75.9,35.9C65.8,47.9,55.3,58.2,42.4,65.6C29.5,73,14.7,77.5,0.3,77C-14.1,76.5,-28.2,71.1,-41.9,64.2C-55.6,57.3,-68.8,49,-75.3,37C-81.7,25,-81.3,9.3,-76.4,-3.9C-71.5,-17.1,-62.1,-27.8,-52.1,-38.1C-42.1,-48.4,-31.6,-58.4,-19.4,-65C-7.3,-71.7,6.6,-75.1,18.9,-72.1C31.2,-69.1,42,-59.7,47.1,-61.5Z"
            />
          </svg>
        </div>
      </div>

      {/* Events Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Seus Eventos</h2>
          <Link href="/events">
            <div className="text-primary hover:text-primary/80 flex items-center text-sm font-medium cursor-pointer">
              Ver todos
              <i className="fas fa-chevron-right ml-2 text-xs"></i>
            </div>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : activeEventsList.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <i className="fas fa-calendar text-primary text-2xl"></i>
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum evento</h3>
            <p className="text-muted-foreground mb-6">Você ainda não tem eventos. Crie seu primeiro evento agora!</p>
            <Link href="/events/new">
              <Button className="gradient-primary">
                <i className="fas fa-plus mr-2"></i> Criar Evento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </div>

      {/* Tasks and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Pending Tasks */}
        <div className="lg:col-span-2">
          <TaskList 
            title="Tarefas Pendentes"
            tasks={pendingTasks}
            loading={isLoading}
          />
        </div>

        {/* Activity Feed */}
        <div>
          <ActivityFeed 
            activities={recentActivities}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
