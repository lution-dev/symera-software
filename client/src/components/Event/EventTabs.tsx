import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import TaskList from "@/components/Dashboard/TaskList";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";

interface EventTabsProps {
  eventId: string | number;
  tasks: any[];
  team: any[];
  activities: any[];
  tasksLoading: boolean;
  teamLoading: boolean;
  activitiesLoading: boolean;
}

const EventTabs: React.FC<EventTabsProps> = ({
  eventId,
  tasks,
  team,
  activities,
  tasksLoading,
  teamLoading,
  activitiesLoading
}) => {
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState("tasks");
  const [, navigate] = useLocation();

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Coluna da esquerda (~260px) - Menu vertical com abas */}
        <div className="w-full md:w-[260px] bg-card rounded-lg shadow-sm">
          <div className="p-3 border-b">
            <h2 className="font-medium text-primary">Seções do Evento</h2>
          </div>
          <div className="flex flex-col w-full space-y-1 p-2">
            <Button 
              variant={activeTab === "tasks" ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 text-left h-auto"
              onClick={() => setActiveTab("tasks")}
            >
              <i className="fas fa-tasks mr-3"></i> 
              Tarefas 
              {tasks?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{tasks.length}</span>}
            </Button>
            <Button 
              variant={activeTab === "team" ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 text-left h-auto"
              onClick={() => setActiveTab("team")}
            >
              <i className="fas fa-users mr-3"></i> 
              Equipe 
              {team?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{team.length}</span>}
            </Button>
            <Button 
              variant={activeTab === "timeline" ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 text-left h-auto"
              onClick={() => setActiveTab("timeline")}
            >
              <i className="fas fa-calendar-alt mr-3"></i> 
              Cronograma
            </Button>
            <Button 
              variant={activeTab === "activity" ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 text-left h-auto"
              onClick={() => setActiveTab("activity")}
            >
              <i className="fas fa-history mr-3"></i> 
              Atividades
              {activities?.length > 0 && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{activities.length}</span>}
            </Button>
          </div>
        </div>
        
        {/* Coluna da direita - Conteúdo da aba selecionada */}
        <div className="flex-1">
          {/* Aba de Tarefas */}
          {activeTab === "tasks" && (
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
          
          {/* Aba de Equipe */}
          {activeTab === "team" && (
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Equipe do Evento</h2>
              
              {teamLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : team?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.map((member: any) => (
                    <div key={member.id} className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={member.user.profileImageUrl} alt={`${member.user.firstName} ${member.user.lastName}`} />
                          <AvatarFallback>{getInitials(`${member.user.firstName} ${member.user.lastName}`)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user.firstName} {member.user.lastName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {member.role === 'organizer' ? 'Organizador' : 
                             member.role === 'assistant' ? 'Assistente' : 
                             member.role === 'vendor' ? 'Fornecedor' : 
                             member.role === 'guest' ? 'Convidado' : 'Membro'}
                          </p>
                        </div>
                      </div>
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
                  <p className="text-muted-foreground mb-6">Adicione membros à equipe para colaborar no evento</p>
                  <Button onClick={() => navigate(`/events/${eventId}/team/add`)}>
                    <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Aba de Cronograma */}
          {activeTab === "timeline" && (
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Cronograma do Evento</h2>
              
              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : tasks && tasks.filter((task: any) => task.dueDate).length > 0 ? (
                <div className="space-y-6">
                  {/* Implementação do cronograma aqui */}
                  <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-border">
                    {tasks
                      .filter((task: any) => task.dueDate)
                      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .map((task: any, index: number) => (
                        <div key={task.id} className="relative mb-6 last:mb-0">
                          <div className="absolute -left-6 top-0 flex items-center justify-center w-8 h-8 transform -translate-x-1/2 rounded-full bg-background border-4 border-background z-10">
                            <div className={`w-5 h-5 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500' : 
                              task.status === 'in_progress' ? 'bg-amber-500' : 
                              task.status === 'todo' ? 'bg-primary' : 'bg-neutral-300'
                            }`}></div>
                          </div>
                          <div className="ml-3 bg-background rounded-lg p-4 border">
                            <div className="flex flex-col sm:flex-row justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                                  task.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' : 
                                  task.status === 'todo' ? 'bg-primary/10 text-primary' : 'bg-neutral-300/10 text-neutral-300'
                                }`}>
                                  {task.status === 'completed' ? 'Concluído' : 
                                  task.status === 'in_progress' ? 'Em andamento' : 
                                  task.status === 'todo' ? 'A fazer' : 'Pendente'}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                                  task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                                  task.priority === 'low' ? 'bg-green-500/10 text-green-500' : 'bg-neutral-300/10 text-neutral-300'
                                }`}>
                                  {task.priority === 'high' ? 'Alta' : 
                                  task.priority === 'medium' ? 'Média' : 
                                  task.priority === 'low' ? 'Baixa' : 'Normal'}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <i className="fas fa-calendar-day mr-1"></i> {formatDate(task.dueDate)}
                            </div>
                          </div>
                        </div>
                      ))}
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
          
          {/* Aba de Atividades */}
          {activeTab === "activity" && (
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

export default EventTabs;