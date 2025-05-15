import React from "react";
import EventForm from "@/components/forms/EventForm";

const CreateEvent: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Criar Novo Evento</h1>
        <p className="text-muted-foreground">
          Preencha os detalhes abaixo para criar seu evento e gerar um checklist inteligente
        </p>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-lg">
        <EventForm />
      </div>
    </div>
  );
};

export default CreateEvent;
