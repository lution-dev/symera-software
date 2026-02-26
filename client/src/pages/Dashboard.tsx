import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardMetrics from "@/components/Dashboard/DashboardMetrics";
import EventCard from "@/components/EventCard";
import TaskList from "@/components/Dashboard/TaskList";
import TipsCard from "@/components/Dashboard/TipsCard";
import {
  Plus,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Store,
  UserPlus,
  CircleDollarSign,
  ClipboardList,
  CalendarDays,
  ArrowUpRight
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

// Utility function to calculate days remaining consistently
const calculateDaysRemaining = (eventDate: string) => {
  const targetDate = new Date(eventDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  targetDate.setUTCHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface DashboardEvent {
  id: number;
  name: string;
  type: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  location?: string;
  status?: string;
  coverImageUrl?: string;
  cover_image_url?: string;
  team?: any[];
  tasks?: any[];
}

interface DashboardTask {
  id: number;
  title: string;
  status: "todo" | "in_progress" | "completed";
}

interface DashboardActivity {
  id: number;
  action: string;
  details: any;
  createdAt: string;
  eventId?: number;
}

interface DashboardData {
  totalEvents: number;
  upcomingEvents: DashboardEvent[];
  activeEventsList: DashboardEvent[];
  pendingTasks: DashboardTask[];
}

// ActivityFeed removed as per user request

const Dashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  const isLoading = authLoading || isDashboardLoading;

  const activeEventsList = useMemo(() => {
    const events = data?.activeEventsList || [];
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    return [...events]
      .sort((a, b) => {
        const dateA = new Date(a.startDate || a.start_date || "2099-12-31");
        const dateB = new Date(b.startDate || b.start_date || "2099-12-31");
        return dateA.getTime() - dateB.getTime();
      });
  }, [data?.activeEventsList]);

  const upcomingEventDays = useMemo(() => {
    const list = data?.upcomingEvents || activeEventsList;
    if (list.length > 0) {
      const dateStr = list[0].startDate || list[0].start_date || "";
      return calculateDaysRemaining(dateStr);
    }
    return 0;
  }, [data?.upcomingEvents, activeEventsList]);

  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Native-style Minimalist Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter">
            Olá, {user?.firstName || "Organizador"}!
          </h1>
        </div>

        <Link href="/events/new" className="hidden md:block">
          <Button className="gradient-primary h-10 md:h-12 px-5 md:px-6 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2 text-sm md:text-base">
            <Plus className="w-4 h-4 md:w-5 md:h-5" /> <span className="inline">Novo Evento</span>
          </Button>
        </Link>
      </header>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="hidden md:grid grid-cols-1 gap-6">
          <DashboardMetrics
            totalEvents={data?.totalEvents || 0}
            activeEvents={activeEventsList.length}
            pendingTasks={data?.pendingTasks.length || 0}
            upcomingEvents={data?.upcomingEvents.length || 0}
            upcomingEventDays={upcomingEventDays}
            isLoading={isLoading}
          />
        </div>

        {/* User hint below metrics */}
        <TipsCard isCreatingFirstEvent={data?.totalEvents === 0} />

        <div className="flex flex-col gap-8">
          {/* Upcoming Events Section */}
          <section className="flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Próximos Eventos ({activeEventsList.length})
              </h2>
              <Link href="/events" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
              </div>
            ) : activeEventsList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl flex-1 flex flex-col items-center justify-center bg-card/30">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-primary/40" />
                </div>
                <h3 className="font-bold text-lg">Pronto para começar?</h3>
                <p className="text-muted-foreground text-sm max-w-[240px] mx-auto mt-2 mb-6">Crie seu primeiro evento e experimente o poder da organização profissional.</p>
                <Link href="/events/new">
                  <Button className="gradient-primary rounded-xl font-bold px-8 shadow-lg shadow-primary/20">Criar Primeiro Evento</Button>
                </Link>
              </div>
            ) : (
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none]">
                {activeEventsList.slice(0, 3).map(event => (
                  <div key={event.id} className={cn("snap-center md:min-w-0", activeEventsList.length === 1 ? "w-full min-w-full" : "min-w-[85vw]")}>
                    <EventCard {...event} from="dashboard" />
                  </div>
                ))}

                {/* Plus card - hidden on mobile, visible on desktop */}
                {!isLoading && (
                  <Link href="/events/new" className="hidden md:block">
                    <div className="h-full min-h-[180px] border-2 border-dashed border-white/10 bg-card/40 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/5 rounded-3xl flex flex-col items-center justify-center p-6 transition-all duration-500 group cursor-pointer shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary/80 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 mb-3 shadow-lg shadow-primary/5 group-hover:shadow-primary/20">
                        <Plus className="w-7 h-7" />
                      </div>
                      <h4 className="font-black text-white/90 text-lg tracking-tight group-hover:text-white transition-colors">Novo Evento</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1 group-hover:text-primary/80 transition-colors">Adicionar Festa</p>
                    </div>
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Task List Section */}
          <section className="w-full">
            <TaskList
              title={`Minhas Tarefas (${data?.pendingTasks.length || 0})`}
              tasks={data?.pendingTasks as any[]}
              loading={isLoading}
              showEventName={true}
              limitTasks={true}
              showFilters={true}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
