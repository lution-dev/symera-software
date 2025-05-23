import React from "react";
import EventForm from "@/components/forms/EventForm";
import { useLocation } from "wouter";

const CreateEvent: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-6 custom-scrollbar">
      {/* Desktop view */}
      <div className="hidden sm:block">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Criar Novo Evento</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes abaixo para criar seu evento e gerar um checklist inteligente
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-lg">
          <EventForm />
        </div>
      </div>
      
      {/* Mobile view */}
      <div className="sm:hidden h-full">
        <div className="mb-4 flex items-center">
          <button
            onClick={() => window.history.back()}
            className="mr-4 text-muted-foreground"
            aria-label="Voltar"
          >
            <i className="fa fa-angle-left text-xl"></i>
          </button>
          <h1 className="text-xl font-bold">Criar Evento</h1>
        </div>
        
        <div className="bg-card p-4 rounded-xl shadow-lg dark:bg-background dark:border-0">
          <EventForm />
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
