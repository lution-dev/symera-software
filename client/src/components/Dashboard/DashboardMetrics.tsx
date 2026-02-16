import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarCheck,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
    text: string;
  };
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isLoading = false,
}) => {
  return (
    <div className="relative overflow-hidden bg-card/60 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl border border-white/5 group hover:border-primary/30 transition-all duration-500">
      {/* Subtle depth effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between h-full gap-3">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-primary/10 rounded-xl text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          {change && !isLoading && (
            <div className={cn(
              "flex items-center gap-0.5 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full",
              change.trend === "up" ? "bg-green-500/10 text-green-400" :
                change.trend === "down" ? "bg-red-500/10 text-red-400" :
                  "bg-muted/30 text-muted-foreground"
            )}>
              {change.trend === "up" ? <TrendingUp className="w-2.5 h-2.5" /> :
                change.trend === "down" ? <TrendingDown className="w-2.5 h-2.5" /> :
                  <Minus className="w-2.5 h-2.5" />}
              {change.value}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground/60 text-[10px] sm:text-sm font-bold uppercase tracking-widest">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
          ) : (
            <div className="flex items-baseline gap-1">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none">{value}</h2>
              {change?.trend === "neutral" && <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{change.text}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DashboardMetricsProps {
  totalEvents: number;
  activeEvents: number;
  pendingTasks: number;
  upcomingEvents: number;
  upcomingEventDays?: number;
  isLoading?: boolean;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalEvents,
  activeEvents,
  pendingTasks,
  upcomingEvents,
  upcomingEventDays = 5,
  isLoading = false
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-2 sm:mb-6">
      <MetricCard
        title="Eventos"
        value={totalEvents}
        icon={CalendarCheck}
        change={{
          value: "+20%",
          trend: "up",
          text: "mês"
        }}
        isLoading={isLoading}
      />

      <MetricCard
        title="Tarefas"
        value={pendingTasks}
        icon={ClipboardList}
        change={{
          value: "+5%",
          trend: "up",
          text: "hoje"
        }}
        isLoading={isLoading}
      />

      <div className="col-span-2 lg:col-span-1">
        <MetricCard
          title="Próximos 30 dias"
          value={upcomingEvents}
          icon={CalendarDays}
          change={{
            value: upcomingEventDays > 0 ? `${upcomingEventDays}d` : "Nenhum",
            trend: "neutral",
            text: "para o próximo"
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default DashboardMetrics;
