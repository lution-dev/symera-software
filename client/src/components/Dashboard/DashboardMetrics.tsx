import React from "react";
import { Link } from "wouter";
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
    <div className="relative overflow-hidden bg-card/40 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-white/5 group hover:border-primary/40 transition-all duration-500 hover:-translate-y-0.5">
      {/* Glossy overlay effect */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />

      {/* Subtle depth effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between h-full gap-2">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-primary/10 rounded-2xl text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-primary/5">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          {change && !isLoading && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full shadow-inner",
              change.trend === "up" ? "bg-green-500/20 text-green-400 border border-green-500/20" :
                change.trend === "down" ? "bg-red-500/20 text-red-400 border border-red-500/20" :
                  "bg-white/5 text-muted-foreground border border-white/10"
            )}>
              {change.trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                change.trend === "down" ? <TrendingDown className="w-3 h-3" /> :
                  <Minus className="w-3 h-3" />}
              {change.value}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 sm:h-10 w-20 sm:w-24 bg-white/5" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none shadow-none drop-shadow-none [text-shadow:none]">{value}</h2>
              {change?.trend === "neutral" && (
                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                  {change.text}
                </span>
              )}
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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-6">
      <Link href="/events">
        <MetricCard
          title="Eventos Ativos"
          value={activeEvents}
          icon={CalendarCheck}
          change={{
            value: "+20%",
            trend: "up",
            text: "mês"
          }}
          isLoading={isLoading}
        />
      </Link>

      <Link href="/events">
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
      </Link>

      <div className="col-span-2 lg:col-span-1">
        <Link href="/events">
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
        </Link>
      </div>
    </div>
  );
};
export default DashboardMetrics;
