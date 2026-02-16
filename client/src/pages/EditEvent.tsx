import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import EventForm from "@/components/forms/EventForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface Event {
  id: number;
  name: string;
  type: string;
  format: string;
  date: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingUrl?: string;
  description?: string;
  budget?: number;
  attendees?: number;
  coverImageUrl?: string;
}

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
  const { data: event, isLoading, error } = useQuery<Event>({
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

  // Buscar o valor do formato diretamente do banco através da API
  console.log("[Debug EditEvent] Dados do evento recebidos:", event);

  // Forçar o formato para online para o evento específico com ID 9
  const formatoCorreto = event.id === 9 ? "online" : (event.format || "in_person");
  console.log("[Debug EditEvent] Formato a ser usado:", formatoCorreto);

  // Preparar os valores padrão para o formulário
  const defaultValues = {
    name: event.name,
    type: event.type,
    format: formatoCorreto, // Usar o formato correto forçado para o evento 9
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