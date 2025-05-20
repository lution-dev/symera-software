import React from "react";
import EventForm from "@/components/forms/EventForm";
import { useLocation } from "wouter";

const CreateEvent: React.FC = () => {
  const [location] = useLocation();
  
  // Estilo para corrigir o problema de dupla rolagem em dispositivos móveis
  const containerStyle: React.CSSProperties = {
    height: window.innerWidth < 768 ? 'calc(100vh - 140px)' : 'auto',
    overflowY: window.innerWidth < 768 ? 'auto' : 'visible',
    paddingBottom: window.innerWidth < 768 ? '120px' : '1.5rem'
  };

  return (
    <div className="container mx-auto px-4 py-6" style={containerStyle}>
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
