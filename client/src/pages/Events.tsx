import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EventCard from "@/components/EventCard";

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [eventTypeFilter, setEventTypeFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("date");

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    
    return events
      .filter((event: any) => {
        // Filter by search term
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filter by event type
        const matchesType = eventTypeFilter === "all" || event.type === eventTypeFilter;
        
        return matchesSearch && matchesType;
      })
      .sort((a: any, b: any) => {
        // Sort events
        if (sortBy === "date") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        } else if (sortBy === "progress") {
          const aProgress = calculateProgress(a.tasks || []);
          const bProgress = calculateProgress(b.tasks || []);
          return bProgress - aProgress; // Highest progress first
        }
        return 0;
      });
  }, [events, searchTerm, eventTypeFilter, sortBy]);

  // Helper function to calculate progress
  const calculateProgress = (tasks: any[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === "completed").length;
    return (completed / tasks.length) * 100;
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 mobile-spacing">
      {/* Header - Visível apenas em tablets e desktop */}
      <div className="hidden sm:flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Meus Eventos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os seus eventos em um só lugar
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/events/new">
            <Button className="gradient-primary">
              <i className="fas fa-plus mr-2"></i> Criar Novo Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile: Filtros simples e integrados - sem duplicação com navbar */}
      <div className="pt-1 pb-3 sm:hidden">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm bg-muted/50 border-0"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters - Redesenhado para mobile */}
      <div className="bg-card rounded-lg mb-6 sm:mb-8 overflow-hidden">
        {/* Versão Mobile: Layout mais compacto apenas com filtros essenciais */}
        <div className="sm:hidden px-4 py-3 flex gap-3">
          <div className="flex-1">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="wedding">Casamento</SelectItem>
                <SelectItem value="corporate">Corporativo</SelectItem>
                <SelectItem value="birthday">Aniversário</SelectItem>
                <SelectItem value="conference">Conferência</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="name">Nome (A-Z)</SelectItem>
                <SelectItem value="progress">Progresso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 w-9 flex items-center justify-center p-0"
            onClick={() => {
              setSearchTerm("");
              setEventTypeFilter("all");
              setSortBy("date");
            }}
          >
            <i className="fas fa-sync-alt text-xs"></i>
          </Button>
        </div>
        
        {/* Versão Desktop: Layout original */}
        <div className="hidden sm:block p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <i className="fas fa-search absolute left-3 top-2.5 text-muted-foreground"></i>
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="wedding">Casamento</SelectItem>
                  <SelectItem value="corporate">Corporativo</SelectItem>
                  <SelectItem value="birthday">Aniversário</SelectItem>
                  <SelectItem value="conference">Conferência</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data (mais próximo)</SelectItem>
                  <SelectItem value="name">Nome (A-Z)</SelectItem>
                  <SelectItem value="progress">Progresso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-calendar text-primary text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || eventTypeFilter !== "all"
              ? "Não foram encontrados eventos com os filtros atuais. Tente alterar os filtros de busca."
              : "Você ainda não tem eventos criados. Crie seu primeiro evento agora!"}
          </p>
          <Link href="/events/new">
            <Button className="gradient-primary">
              <i className="fas fa-plus mr-2"></i> Criar Evento
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event: any) => (
            <EventCard
              key={event.id}
              id={event.id}
              name={event.name}
              type={event.type}
              date={event.date}
              location={event.location}
              status={event.status}
              attendees={event.attendees}
              team={event.team || []}
              tasks={event.tasks || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
