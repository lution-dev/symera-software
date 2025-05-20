import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import TaskList from "@/components/Dashboard/TaskList";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import VerticalNavigation from "@/components/VerticalNavigation";

interface EventProps {
  id?: string;
}

const EventWithVerticalNav: React.FC<EventProps> = ({ id }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Extrair o ID da URL se não recebido como prop
  const eventId = id || location.split('/')[2];
  
  // Consultas para buscar dados do evento, tarefas, equipe e atividades
  const { data: event = {}, isLoading: eventLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated
  });
  
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/tasks`],
    enabled: !!eventId && isAuthenticated
  });
  
  const { data: team = [], isLoading: teamLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId && isAuthenticated
  });
  
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/activities`],
    enabled: !!eventId && isAuthenticated
  });
  
  // Tabs para o menu de navegação vertical
  const navigationTabs = [
    { 
      id: 'tasks', 
      label: 'Tarefas', 
      icon: 'tasks',
      count: Array.isArray(tasks) ? tasks.length : 0
    },
    { 
      id: 'team', 
      label: 'Equipe', 
      icon: 'users',
      count: Array.isArray(team) ? team.length : 0
    },
    { 
      id: 'timeline', 
      label: 'Cronograma', 
      icon: 'calendar-alt',
      count: Array.isArray(tasks) ? tasks.filter((task: any) => !!task.dueDate).length : 0
    },
    { 
      id: 'activity', 
      label: 'Atividades', 
      icon: 'history',
      count: Array.isArray(activities) ? activities.length : 0
    }
  ];

  if (eventLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 mobile-spacing">
      <h1 className="text-2xl font-bold mt-2 mb-4">{event.name || 'Detalhes do Evento'}</h1>
      
      {/* Layout de duas colunas com menu vertical */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Coluna da esquerda - Menu vertical (~260px) */}
        <VerticalNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={navigationTabs}
        />
        
        {/* Coluna da direita - Conteúdo da aba selecionada */}
        <div className="flex-grow">
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h2 className="text-xl font-semibold">Checklist do Evento</h2>
                <div className="flex flex-wrap w-full sm:w-auto gap-2">
                  <Button onClick={() => navigate(`/events/${eventId}/tasks/new`)} variant="default" className="flex-1 sm:flex-auto">
                    <i className="fas fa-plus mr-2"></i> Nova Tarefa
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/events/${eventId}/checklist`)}>
                    <i className="fas fa-external-link-alt mr-2"></i> Ver tudo
                  </Button>
                </div>
              </div>
              
              <TaskList
                title=""
                tasks={tasks}
                loading={tasksLoading}
                showEventName={false}
              />
            </div>
          )}
          
          {activeTab === 'team' && (
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Equipe do Evento</h2>
              
              {teamLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : Array.isArray(team) && team.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.map((member: any) => (
                    <div key={member.id} className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center">
                        {member.user.profileImageUrl ? (
                          <img 
                            src={member.user.profileImageUrl} 
                            alt={`${member.user.firstName} ${member.user.lastName}`}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                            <span className="text-primary font-medium">
                              {member.user.firstName?.charAt(0) || ''}
                              {member.user.lastName?.charAt(0) || ''}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.role === 'organizer' ? 'Organizador' : 
                            member.role === 'team_member' ? 'Membro da Equipe' : 
                            'Fornecedor'}
                          </p>
                        </div>
                      </div>
                      {member.user.email && (
                        <div className="mt-3 text-sm flex items-center text-muted-foreground">
                          <i className="fas fa-envelope mr-2"></i>
                          <span>{member.user.email}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <i className="fas fa-users text-primary text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhum membro na equipe</h3>
                  <p className="text-muted-foreground mb-6">Adicione membros para colaborar no evento</p>
                  <Button>
                    <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'timeline' && (
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Cronograma do Evento</h2>
              
              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : Array.isArray(tasks) && tasks.filter((task: any) => !!task.dueDate).length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted"></div>
                  
                  <div className="space-y-6">
                    {tasks
                      .filter((task: any) => !!task.dueDate)
                      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .map((task: any) => {
                        const today = new Date();
                        const dueDate = new Date(task.dueDate);
                        const isPast = dueDate < today;
                        const isToday = dueDate.toDateString() === today.toDateString();
                        
                        let statusColor = "bg-muted";
                        if (task.status === "completed") {
                          statusColor = "bg-green-500";
                        } else if (isPast) {
                          statusColor = "bg-red-500";
                        } else if (isToday) {
                          statusColor = "bg-yellow-500";
                        } else if (task.status === "in_progress") {
                          statusColor = "bg-blue-500";
                        }
                        
                        return (
                          <div key={task.id} className="flex">
                            <div className="flex-shrink-0 z-10">
                              <div className={`flex items-center justify-center w-7 h-7 rounded-full ${statusColor} shadow-lg`}>
                                <i className={`fas fa-${
                                  task.status === "completed" ? "check" : 
                                  isPast ? "exclamation" : 
                                  task.status === "in_progress" ? "spinner" : 
                                  "calendar"
                                } text-white text-xs`}></i>
                              </div>
                            </div>
                            <div className="ml-4">
                              <h3 className={`font-medium ${task.status === "completed" ? "line-through opacity-60" : ""}`}>
                                {task.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mt-1">
                                {formatDate(task.dueDate)}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  task.status === "completed" ? "bg-green-500/10 text-green-500" :
                                  task.status === "in_progress" ? "bg-blue-500/10 text-blue-500" :
                                  "bg-gray-500/10 text-gray-400"
                                }`}>
                                  {task.status === "completed" ? "Concluída" : 
                                  task.status === "in_progress" ? "Em andamento" : 
                                  "A fazer"}
                                </span>
                                {task.priority && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    task.priority === "high" ? "bg-red-500/10 text-red-500" :
                                    task.priority === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                                    task.priority === "low" ? "bg-green-500/10 text-green-500" :
                                    "bg-gray-500/10 text-gray-400"
                                  }`}>
                                    {task.priority === "high" ? "Alta prioridade" : 
                                    task.priority === "medium" ? "Média prioridade" : 
                                    "Baixa prioridade"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <i className="fas fa-calendar-day text-primary text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhuma tarefa com prazo definido</h3>
                  <p className="text-muted-foreground mb-6">Adicione tarefas com prazos para visualizar o cronograma do evento</p>
                  <Button onClick={() => navigate(`/events/${eventId}/checklist`)}>
                    <i className="fas fa-tasks mr-2"></i> Gerenciar Checklist
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'activity' && (
            <ActivityFeed
              activities={activities}
              loading={activitiesLoading}
              limit={10}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventWithVerticalNav;