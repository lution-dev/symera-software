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
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Store,
  UserPlus
} from "lucide-react";
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

const Dashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const isMobile = useIsMobile();
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

  // Activity related functions removed for simplicity

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 bg-gradient-to-br from-primary/10 via-background to-background p-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
          <LayoutGrid className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary/80">Painel de Controle</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
            Olá, {user?.firstName || "Organizador"}!
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md font-medium">
            Você tem <span className="text-white font-bold">{data?.totalEvents || 0} eventos</span> registrados e <span className="text-white font-bold">{data?.pendingTasks.length || 0} tarefas</span> aguardando sua ação.
          </p>
        </div>
        <div className="relative z-10 flex gap-3 sm:flex">
          <Link href="/events/new" className="hidden sm:inline-flex">
            <Button className="gradient-primary h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2">
              <Plus className="w-5 h-5" /> Novo Evento
            </Button>
          </Link>
        </div>
      </header>

      {/* Optimized Main Layout */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

        <div className="grid grid-cols-1 gap-6">
          <DashboardMetrics
            totalEvents={data?.totalEvents || 0}
            activeEvents={activeEventsList.length}
            pendingTasks={data?.pendingTasks.length || 0}
            upcomingEvents={data?.upcomingEvents.length || 0}
            upcomingEventDays={upcomingEventDays}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Upcoming Events Section */}
          <section className="bg-card/50 rounded-3xl p-6 border border-white/5 backdrop-blur-sm shadow-xl flex flex-col h-full">
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
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl flex-1 flex flex-col items-center justify-center bg-primary/5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {activeEventsList.slice(0, 2).map(event => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            )}
          </section>

          {/* Task List Section */}
          <section className="h-full">
            <TaskList
              title="Tarefas Prioritárias"
              tasks={data?.pendingTasks as any[]}
              loading={isLoading}
              showEventName={true}
              limitTasks={true}
              showFilters={true}
            />
          </section>
        </div>
      </div>

      {/* Tips Section */}
      <div className="max-w-3xl">
        <TipsCard isCreatingFirstEvent={data?.totalEvents === 0} />
      </div>

      {/* Mobile-only Quick Access */}
      <div className="lg:hidden grid grid-cols-2 gap-4 pt-4">
        <Link href="/vendors" className="group">
          <div className="bg-card p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all text-center flex flex-col items-center gap-2 shadow-lg active:scale-95 duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fornecedores</span>
          </div>
        </Link>
        <Link href="/team" className="group">
          <div className="bg-card p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all text-center flex flex-col items-center gap-2 shadow-lg active:scale-95 duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Equipe</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
