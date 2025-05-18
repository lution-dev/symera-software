import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Ícones
import { ChevronLeft, Calendar, Clock, Users, MapPin, ArrowRight, PlusCircle } from "lucide-react";

interface Event {
  id: number;
  name: string;
  date: string;
  location?: string;
  description?: string;
  type: string;
}

const ProfileEventos: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Query para buscar eventos do usuário
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", "user"],
    enabled: !!user,
    initialData: [],
  });

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return "Data desconhecida";
    }
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "corporate": "Corporativo",
      "wedding": "Casamento",
      "birthday": "Aniversário", 
      "conference": "Conferência",
      "other": "Outro"
    };
    return types[type] || "Evento";
  };

  const renderEventList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      );
    }

    if (!events || events.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Você ainda não criou nenhum evento na plataforma.
          </p>
          <Button onClick={() => navigate("/events/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Evento
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:border-primary transition-colors">
            <CardContent className="p-0">
              <div className="cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        {getEventTypeLabel(event.type)}
                      </Badge>
                      <h3 className="text-lg font-medium line-clamp-1">{event.name}</h3>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatEventDate(event.date)}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Meus Eventos</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
          <CardDescription>
            Gerencie todos os seus eventos na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderEventList()}
        </CardContent>
        {events && events.length > 0 && (
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full" onClick={() => navigate("/events/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Novo Evento
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ProfileEventos;