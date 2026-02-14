import React from "react";
import { formatActivityTimestamp } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  CalendarPlus,
  CalendarCheck,
  ListTodo,
  Check,
  UserPlus,
  Bot,
  Bell,
  Calendar as CalendarIcon
} from "lucide-react";

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
    case "created_event": return { icon: CalendarPlus, color: "text-orange-500 bg-orange-500/10" };
    case "updated_event": return { icon: CalendarCheck, color: "text-blue-500 bg-blue-500/10" };
    case "created_task": return { icon: ListTodo, color: "text-green-500 bg-green-500/10" };
    case "updated_task": return { icon: Check, color: "text-green-500 bg-green-500/10" };
    case "added_team_member": return { icon: UserPlus, color: "text-purple-500 bg-purple-500/10" };
    case "generated_ai_checklist": return { icon: Bot, color: "text-primary bg-primary/10" };
    default: return { icon: Bell, color: "text-muted-foreground bg-muted" };
  }
};

const getActivityText = (activity: Activity) => {
  const { action, details } = activity;

  switch (action) {
    case "created_event": return `Criou o evento "${details.eventName || 'Evento'}"`;
    case "updated_event": return `Atualizou o evento "${details.eventName || 'Evento'}"`;
    case "created_task": return `Adicionou a tarefa "${details.taskTitle || 'Tarefa'}"`;
    case "updated_task":
      if (details.changes?.status === "completed") {
        return `Concluiu a tarefa "${details.taskTitle || 'Tarefa'}"`;
      }
      return `Atualizou a tarefa "${details.taskTitle || 'Tarefa'}"`;
    case "added_team_member":
      return `Adicionou ${details.memberEmail} como ${details.role === 'organizer' ? 'organizador' : 'membro'}`;
    case "generated_ai_checklist":
      return `Gerou checklist com IA (${details.taskCount} tarefas)`;
    default:
      return "Realizou uma ação";
  }
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities: propActivities,
  loading: propLoading,
  limit = 4
}) => {
  const { data: apiActivities, isLoading: apiLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    enabled: !propActivities,
    select: (data) => data.recentActivities,
  });

  const activities = propActivities || apiActivities || [];
  const loading = propLoading || (apiLoading && !propActivities);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6 border border-white/5 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-muted/50 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-8 border border-white/5 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <History className="text-primary w-6 h-6" />
        </div>
        <h3 className="font-bold">Nenhuma atividade</h3>
        <p className="text-muted-foreground text-xs mt-1">As atividades aparecerão aqui conforme você interagir.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-white/5 shadow-xl p-5">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <History className="w-5 h-5 text-primary" /> Atividade Recente
      </h2>

      <div className="relative space-y-4">
        {activities.slice(0, limit).map((activity) => {
          const { icon: Icon, color } = getActivityIcon(activity.action);

          return (
            <div key={activity.id} className="flex gap-4 group">
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-semibold text-white leading-tight">{getActivityText(activity)}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatActivityTimestamp(activity.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-muted-foreground font-medium truncate">{activity.userName || 'Você'}</p>
                  {activity.eventName && (
                    <>
                      <span className="text-muted-foreground/30">•</span>
                      <p className="text-[10px] text-primary font-bold truncate flex items-center gap-1">
                        <CalendarIcon className="w-2.5 h-2.5" /> {activity.eventName}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
