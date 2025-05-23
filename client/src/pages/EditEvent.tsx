import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import EventForm from "@/components/forms/EventForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface EditEventProps {
  id?: string;
}

const EditEvent: React.FC<EditEventProps> = ({ id }) => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Extrair o ID da URL se não recebido como prop
  const eventId = id || location.split('/')[2];
  
  // Buscar os detalhes do evento para preencher o formulário
  const { data: event, isLoading, error } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated,
    retry: 1
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-xl p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Evento não encontrado</h3>
          <p className="text-muted-foreground mb-6">
            O evento que você está tentando editar não existe ou você não tem permissão para acessá-lo.
          </p>
          <Button onClick={() => navigate("/events")}>
            <i className="fas fa-arrow-left mr-2"></i> Voltar para Eventos
          </Button>
        </div>
      </div>
    );
  }
  
  // Preparar os valores padrão para o formulário
  const defaultValues = {
    name: event.name,
    type: event.type,
    format: event.format || "in_person", // Valor padrão se não existir
    date: event.date,
    startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
    endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    location: event.location || "",
    meetingUrl: event.meetingUrl || "",
    description: event.description || "",
    budget: event.budget,
    attendees: event.attendees,
    coverImageUrl: event.coverImageUrl || "",
  };
  
  return (
    <div className="container mx-auto px-4 py-6 custom-scrollbar">
      <div className="mb-6 md:mb-8">
        <Button 
          variant="link" 
          onClick={() => navigate(`/events/${eventId}`)} 
          className="text-primary hover:underline flex items-center mb-2 p-0"
        >
          <i className="fas fa-arrow-left mr-2"></i> Voltar para detalhes do evento
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Editar Evento</h1>
        <p className="text-muted-foreground">
          Atualize as informações do seu evento
        </p>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-xl shadow-lg">
        <EventForm 
          defaultValues={defaultValues}
          isEdit={true}
          eventId={parseInt(eventId)}
        />
      </div>
    </div>
  );
};

export default EditEvent;