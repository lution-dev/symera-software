import React from "react";
import EventForm from "@/components/forms/EventForm";
import { useLocation } from "wouter";

const CreateEvent: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Criar Novo Evento</h1>
        <p className="text-muted-foreground">
          Preencha os detalhes abaixo para criar seu evento e gerar um checklist inteligente
        </p>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-xl shadow-lg">
        <EventForm />
      </div>
    </div>
  );
};

export default CreateEvent;
