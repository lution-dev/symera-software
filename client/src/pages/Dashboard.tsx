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
      })
      .filter(event => new Date(event.startDate || event.start_date || "2099-12-31") >= now);
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

          {/* Mobile Pill - Integrated next to name */}
          <div className="md:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-muted-foreground bg-white/5 active:bg-white/10 px-3.5 py-2 rounded-full border border-white/10 transition-colors cursor-pointer shadow-sm">
                  <span className="text-white">{activeEventsList.length}</span> eventos
                  <span className="mx-0.5 opacity-30">•</span>
                  <span className="text-white">{data?.pendingTasks.length || 0}</span> tarefas
                  <span className="mx-0.5 opacity-30">•</span>
                  <CalendarDays className="w-3.5 h-3.5 text-primary/80" />
                </div>
              </DrawerTrigger>
              <DrawerContent className="bg-purple-dark border-white/10 pb-10 px-4">
                <DrawerHeader className="text-left px-2 mb-2">
                  <DrawerTitle className="text-2xl font-black text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" /> Visão Geral
                  </DrawerTitle>
                </DrawerHeader>

                <div className="grid gap-4 mt-4">
                  <Link href="/events" onClick={() => document.dispatchEvent(new CustomEvent('closeDrawer'))}>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <CalendarCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Eventos Ativos</p>
                          <p className="text-xl font-black text-white">{activeEventsList.length} <span className="text-xs text-muted-foreground font-normal ml-1">eventos de {data?.totalEvents || 0}</span></p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tarefas Pendentes</p>
                        <p className="text-xl font-black text-white">
                          {data?.pendingTasks.length || 0} <span className="text-xs text-muted-foreground font-normal ml-1">tarefas para hoje</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Próximos 30 dias</p>
                        <p className="text-xl font-black text-white">{data?.upcomingEvents?.length || 0} <span className="text-xs text-muted-foreground font-normal ml-1">eventos marcados</span></p>
                      </div>
                    </div>
                  </div>

                  <DrawerClose asChild>
                    <Button variant="outline" className="mt-4 h-12 rounded-xl border-white/10 font-black tracking-tight active:scale-[0.98]">
                      Fechar
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
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
                <Calendar className="w-5 h-5 text-primary" /> Próximos Eventos
              </h2>
              <Link href="/events" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeEventsList.slice(0, 5).map(event => (
                  <EventCard key={event.id} {...event} />
                ))}

                {/* Plus card - always visible for layout consistency */}
                {!isLoading && (
                  <Link href="/events/new">
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
              title="Minha Lista de Tarefas"
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
