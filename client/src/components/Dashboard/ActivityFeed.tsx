import React from "react";
import { formatActivityTimestamp } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface Activity {
  id: number;
  eventId: number;
  userId: string;
  action: string;
  details: Record<string, any>;
  createdAt: string;
  userName?: string;
  eventName?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  loading?: boolean;
  limit?: number;
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case "created_event":
      return { icon: "calendar-plus", color: "bg-orange-500" };
    case "updated_event":
      return { icon: "calendar-check", color: "bg-blue-500" };
    case "created_task":
      return { icon: "tasks", color: "bg-green-500" };
    case "updated_task":
      return { icon: "check", color: "bg-green-500" };
    case "added_team_member":
      return { icon: "user-plus", color: "bg-purple-500" };
    case "generated_ai_checklist":
      return { icon: "robot", color: "bg-primary" };
    default:
      return { icon: "bell", color: "bg-muted" };
  }
};

const getActivityText = (activity: Activity) => {
  const { action, details } = activity;
  
  switch (action) {
    case "created_event":
      return `Criou o evento "${details.eventName || 'Evento'}"`;
    case "updated_event":
      return `Atualizou o evento "${details.eventName || 'Evento'}"`;
    case "created_task":
      return `Adicionou a tarefa "${details.taskTitle || 'Tarefa'}"`;
    case "updated_task":
      if (details.changes?.status === "completed") {
        return `Concluiu a tarefa "${details.taskTitle || 'Tarefa'}"`;
      }
      return `Atualizou a tarefa "${details.taskTitle || 'Tarefa'}"`;
    case "added_team_member":
      return `Adicionou ${details.memberEmail} como ${details.role === 'organizer' ? 'organizador' : details.role === 'team_member' ? 'membro da equipe' : 'fornecedor'}`;
    case "generated_ai_checklist":
      return `Gerou um checklist com IA com ${details.taskCount} tarefas`;
    default:
      return "Realizou uma ação";
  }
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities: propActivities, 
  loading: propLoading,
  limit = 4 
}) => {
  // If activities are not provided via props, fetch them from the API
  const { data: apiActivities, isLoading: apiLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    enabled: !propActivities,
    select: (data) => data.recentActivities,
  });

  const activities = propActivities || apiActivities || [];
  const loading = propLoading || (apiLoading && !propActivities);

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Atividade Recente</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Atividade Recente</h2>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-history text-primary text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhuma atividade recente</h3>
          <p className="text-muted-foreground">As atividades aparecerão aqui conforme você interagir com a plataforma.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-lg p-5">
      <h2 className="text-xl font-semibold text-white mb-6">Atividade Recente</h2>
      
      <div className="relative">
        <div className="absolute left-5 top-0 h-full w-0.5 bg-muted"></div>
        
        {activities.slice(0, limit).map((activity) => {
          const { icon, color } = getActivityIcon(activity.action);
          
          return (
            <div key={activity.id} className="ml-10 mb-6 relative">
              <div className={`absolute -left-10 top-1 w-5 h-5 rounded-full ${color} border-4 border-card z-10`}></div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{getActivityText(activity)}</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {activity.userName || 'Você'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatActivityTimestamp(activity.createdAt)}</span>
                </div>
                {activity.eventName && (
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-primary mr-1"><i className="fas fa-calendar-alt"></i></span>
                    <span className="text-muted-foreground">{activity.eventName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {activities.length > limit && (
        <div className="mt-6 text-center">
          <button className="text-primary hover:text-white transition-colors text-sm font-medium">
            Ver mais atividades
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
