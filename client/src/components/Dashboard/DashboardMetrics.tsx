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
    <div className="relative overflow-hidden bg-card rounded-2xl p-4 sm:p-5 shadow-lg border border-white/5 group hover:border-primary/20 transition-all duration-300">
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs sm:text-sm font-medium tracking-tight">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tighter">{value}</h2>
          )}
        </div>
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {(change || isLoading) && (
        <div className="mt-4 flex items-center gap-2 h-5">
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            change && (
              <>
                <div className={cn(
                  "flex items-center gap-1 text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md",
                  change.trend === "up" ? "bg-green-500/10 text-green-400" :
                    change.trend === "down" ? "bg-red-500/10 text-red-400" :
                      "bg-muted text-muted-foreground"
                )}>
                  {change.trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                    change.trend === "down" ? <TrendingDown className="w-3 h-3" /> :
                      <Minus className="w-3 h-3" />}
                  {change.value}
                </div>
                <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">{change.text}</span>
              </>
            )
          )}
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
    <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-4 mb-2 sm:mb-6 no-scrollbar snap-x snap-mandatory">
      <div className="min-w-[280px] sm:min-w-0 snap-center">
        <MetricCard
          title="Total de Eventos"
          value={totalEvents}
          icon={CalendarCheck}
          change={{
            value: "20%",
            trend: "up",
            text: "este mês"
          }}
          isLoading={isLoading}
        />
      </div>

      <div className="min-w-[280px] sm:min-w-0 snap-center">
        <MetricCard
          title="Tarefas Pendentes"
          value={pendingTasks}
          icon={ClipboardList}
          change={{
            value: "5%",
            trend: "up",
            text: "desde ontem"
          }}
          isLoading={isLoading}
        />
      </div>

      <div className="min-w-[280px] sm:min-w-0 snap-center">
        <MetricCard
          title="Próximos em 30d"
          value={upcomingEvents}
          icon={CalendarDays}
          change={{
            value: upcomingEventDays > 0 ? `Em ${upcomingEventDays} dias` : "Nenhum",
            trend: "neutral",
            text: "próximo evento"
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default DashboardMetrics;
