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
    <div className="bg-card rounded-lg p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs sm:text-sm">{title}</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-1">{value}</h2>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center">
          <i className={`far fa-${icon} text-primary text-lg sm:text-xl`}></i>
        </div>
      </div>
      {change && (
        <div className="mt-3 sm:mt-4 flex items-center flex-wrap">
          <span className={`text-xs sm:text-sm flex items-center ${change.trend === "up" ? "text-green-400" : change.trend === "down" ? "text-red-400" : "text-gray-400"}`}>
            <i className={`far fa-arrow-${change.trend} mr-1`}></i> {change.value}
          </span>
          <span className="text-muted-foreground text-xs sm:text-sm ml-2">{change.text}</span>
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
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
      
      {/* Em telas pequenas, este cartão ocupa toda a largura */}
      <div className="col-span-2 md:col-span-1">
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
    </div>
  );
};

export default DashboardMetrics;
