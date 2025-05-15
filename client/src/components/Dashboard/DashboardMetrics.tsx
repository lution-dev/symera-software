import React from "react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
    text: string;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
}) => {
  return (
    <div className="bg-card rounded-lg p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h2 className="text-3xl font-bold text-white mt-1">{value}</h2>
        </div>
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <i className={`fas fa-${icon} text-primary text-xl`}></i>
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm flex items-center ${change.trend === "up" ? "text-green-400" : change.trend === "down" ? "text-red-400" : "text-gray-400"}`}>
            <i className={`fas fa-arrow-${change.trend} mr-1`}></i> {change.value}
          </span>
          <span className="text-muted-foreground text-sm ml-2">{change.text}</span>
        </div>
      )}
    </div>
  );
};

interface DashboardMetricsProps {
  totalEvents: number;
  activeEvents: number;
  pendingTasks: number;
  upcomingEvents: number;
  upcomingEventDays?: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalEvents,
  activeEvents,
  pendingTasks,
  upcomingEvents,
  upcomingEventDays = 5
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-6 mb-6">
      <MetricCard
        title="Total de Eventos"
        value={totalEvents}
        icon="calendar-check"
        change={{
          value: "20%",
          trend: "up",
          text: "desde o mês passado"
        }}
      />
      
      <MetricCard
        title="Tarefas Pendentes"
        value={pendingTasks}
        icon="clipboard-list"
        change={{
          value: "5%",
          trend: "up",
          text: "desde a semana passada"
        }}
      />
      
      <MetricCard
        title="Eventos Este Mês"
        value={upcomingEvents}
        icon="calendar-alt"
        change={{
          value: upcomingEventDays > 0 ? `Próximo em ${upcomingEventDays} dias` : "Não há eventos próximos",
          trend: "neutral",
          text: ""
        }}
      />
    </div>
  );
};

export default DashboardMetrics;
