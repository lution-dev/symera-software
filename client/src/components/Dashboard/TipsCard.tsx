import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Define different tip sets for rotation
const TIP_SETS = [
  // Set 1: Boas práticas de organização
  {
    cardTips: [
      { icon: "task", text: "Use o assistente IA para criar listas de tarefas completas" },
      { icon: "building", text: "Adicione fornecedores para controlar o orçamento" },
      { icon: "users", text: "Convide membros para sua equipe do evento" },
    ],
    modalTips: [
      { 
        icon: "lightbulb", 
        title: "Planejamento completo", 
        description: "Use o assistente de IA para criar listas de tarefas personalizadas com base no tipo e tamanho do seu evento."
      },
      { 
        icon: "users", 
        title: "Colaboração em equipe", 
        description: "Convide colaboradores e atribua tarefas específicas para manter todos atualizados sobre suas responsabilidades."
      },
      { 
        icon: "chart-pie", 
        title: "Controle de orçamento", 
        description: "Registre fornecedores e custos para acompanhar seu orçamento e evitar gastos excessivos."
      },
      { 
        icon: "calendar-check", 
        title: "Cronograma inteligente", 
        description: "Organize tarefas por prioridade e data para garantir que nada importante seja esquecido."
      }
    ],
    ctaText: "Criar novo evento",
    ctaLink: "/events/new"
  },
  
  // Set 2: Recursos avançados da Symera
  {
    cardTips: [
      { icon: "chart-line", text: "Acompanhe o progresso com relatórios detalhados" },
      { icon: "file-alt", text: "Exporte suas listas de tarefas e orçamentos" },
      { icon: "bell", text: "Configure notificações para eventos próximos" },
    ],
    modalTips: [
      { 
        icon: "chart-line", 
        title: "Analytics avançados", 
        description: "Acompanhe o progresso do seu evento com relatórios detalhados e visualizações personalizadas."
      },
      { 
        icon: "file-export", 
        title: "Exportação de dados", 
        description: "Exporte listas de tarefas, orçamentos e informações de fornecedores para compartilhar com sua equipe."
      },
      { 
        icon: "bell", 
        title: "Sistema de notificações", 
        description: "Configure alertas para prazos de tarefas, pagamentos e eventos próximos."
      },
      { 
        icon: "sliders-h", 
        title: "Personalizações", 
        description: "Adapte a plataforma às necessidades específicas do seu evento com configurações avançadas."
      }
    ],
    ctaText: "Explorar recursos avançados",
    ctaLink: "/settings"
  },
  
  // Set 3: Dicas de produtividade e controle
  {
    cardTips: [
      { icon: "tasks", text: "Priorize tarefas para otimizar seu tempo" },
      { icon: "comments", text: "Use comentários para comunicar com a equipe" },
      { icon: "clipboard-check", text: "Faça revisões semanais do progresso" },
    ],
    modalTips: [
      { 
        icon: "tasks", 
        title: "Gestão de prioridades", 
        description: "Organize suas tarefas por prioridade para focar no que realmente importa no momento."
      },
      { 
        icon: "comments", 
        title: "Comunicação eficiente", 
        description: "Utilize comentários em tarefas para manter toda a comunicação centralizada e acessível."
      },
      { 
        icon: "clipboard-check", 
        title: "Revisões periódicas", 
        description: "Dedique tempo semanalmente para revisar o progresso e ajustar o planejamento conforme necessário."
      },
      { 
        icon: "clock", 
        title: "Gestão de tempo", 
        description: "Estime e controle o tempo necessário para cada tarefa para garantir prazos realistas."
      }
    ],
    ctaText: "Ver minhas tarefas pendentes",
    ctaLink: "/tasks"
  }
];

interface TipsCardProps {
  // Optional props to override automatic rotation
  tipSetIndex?: number;
  isCreatingFirstEvent?: boolean;
  hasTeamMembers?: boolean;
  hasVendors?: boolean;
  hasTasks?: boolean;
}

const TipsCard: React.FC<TipsCardProps> = ({ 
  tipSetIndex: forcedTipSetIndex,
  isCreatingFirstEvent = false,
  hasTeamMembers = false,
  hasVendors = false,
  hasTasks = false
}) => {
  // State to track which tip set to display
  const [activeTipSetIndex, setActiveTipSetIndex] = useState<number>(0);
  // State to track user preference for showing the card
  const [showTipsCard, setShowTipsCard] = useState<boolean>(true);
  // State to track if card is minimized
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has a preference stored
    const storedPreference = localStorage.getItem('showTipsCard');
    if (storedPreference !== null) {
      setShowTipsCard(storedPreference === 'true');
    }

    const storedMinimized = localStorage.getItem('tipsCardMinimized');
    if (storedMinimized !== null) {
      setIsMinimized(storedMinimized === 'true');
    }

    // If a specific tip set index is provided, use it
    if (forcedTipSetIndex !== undefined && forcedTipSetIndex >= 0 && forcedTipSetIndex < TIP_SETS.length) {
      setActiveTipSetIndex(forcedTipSetIndex);
      return;
    }

    // Otherwise, determine the best tip set based on user context
    // For demo purposes, we'll just rotate weekly, but in a real app
    // you would add more sophisticated logic based on user behavior
    const determineContextualTipSet = () => {
      // Logic to choose a tip set based on user context
      if (isCreatingFirstEvent) {
        return 0; // Show organization tips for new users
      } else if (!hasTeamMembers || !hasVendors) {
        return 0; // Still show basics if user hasn't added team or vendors
      } else if (!hasTasks) {
        return 2; // Show productivity tips if they have team but no tasks
      } else {
        // Default: use day of year to rotate tips weekly
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(dayOfYear / 7);
        return weekNumber % TIP_SETS.length;
      }
    };

    const tipIndex = determineContextualTipSet();
    setActiveTipSetIndex(tipIndex);
  }, [forcedTipSetIndex, isCreatingFirstEvent, hasTeamMembers, hasVendors, hasTasks]);

  // Don't render if user has chosen to hide the card
  if (!showTipsCard) {
    return null;
  }

  const handleHideTipsCard = () => {
    setShowTipsCard(false);
    localStorage.setItem('showTipsCard', 'false');
  };

  const handleToggleMinimize = () => {
    const newIsMinimized = !isMinimized;
    setIsMinimized(newIsMinimized);
    localStorage.setItem('tipsCardMinimized', newIsMinimized.toString());
  };

  const activeTipSet = TIP_SETS[activeTipSetIndex];

  return (
    <div className="mb-5 sm:mb-8 bg-card rounded-xl p-3 sm:p-6 shadow-lg relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="flex items-center">
            <i className="fas fa-lightbulb text-primary mr-2 text-sm sm:text-base"></i>
            <h2 className="text-sm sm:text-xl font-semibold sm:font-bold">Dicas para o seu evento</h2>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleToggleMinimize}
              className="text-muted-foreground hover:text-primary text-xs p-1 rounded-full hover:bg-primary/10 transition-colors"
              aria-label={isMinimized ? "Expandir dicas" : "Minimizar dicas"}
            >
              <i className={`fas fa-${isMinimized ? 'expand' : 'compress'} text-xs`}></i>
            </button>
            <button 
              onClick={handleHideTipsCard}
              className="text-muted-foreground hover:text-primary text-xs p-1 rounded-full hover:bg-primary/10 transition-colors"
              aria-label="Não mostrar dicas"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            <ul className="text-muted-foreground text-xs sm:text-sm space-y-1 sm:space-y-2 ml-1 mb-2 sm:mb-3 max-w-xl">
              {activeTipSet.cardTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 flex-shrink-0">
                    <i className={`fas fa-${tip.icon} text-xs`}></i>
                  </div>
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
            
            {/* Modal de dicas */}
            <Dialog>
              <DialogTrigger className="text-primary text-xs sm:text-sm font-medium hover:underline flex items-center bg-transparent border-0 p-0 cursor-pointer">
                <span>Ver todas as dicas</span>
                <i className="fas fa-arrow-right ml-1.5 text-xs"></i>
              </DialogTrigger>
              <DialogContent className="w-[90%] sm:max-w-[500px] rounded-xl">
                <DialogHeader>
                  <DialogTitle>Dicas para organizar eventos</DialogTitle>
                </DialogHeader>
                <div className="py-3 space-y-4">
                  <div className="space-y-3">
                    {activeTipSet.modalTips.map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
                          <i className={`fas fa-${tip.icon}`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base">{tip.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Link href={activeTipSet.ctaLink}>
                    <Button className="w-full sm:w-auto">
                      {activeTipSet.ctaText}
                    </Button>
                  </Link>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
      
      {/* Abstract decoration - hidden on small mobile and when minimized */}
      {!isMinimized && (
        <div className="absolute top-0 right-0 w-28 sm:w-64 h-full opacity-10 hidden sm:block">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor"
              className="text-primary"
              d="M47.1,-61.5C60.9,-52.7,71.8,-38.6,76.3,-22.7C80.8,-6.9,78.8,10.6,71.8,25.4C64.9,40.2,52.9,52.3,38.9,59.4C24.8,66.5,8.7,68.6,-7.2,67.3C-23.1,66,-38.8,61.3,-50.8,51.5C-62.8,41.7,-71.1,26.7,-74.9,10.1C-78.7,-6.5,-78,-24.8,-68.9,-38C-59.9,-51.3,-42.5,-59.4,-26.6,-67C-10.7,-74.6,3.6,-81.6,18.7,-79.5C33.8,-77.4,47.1,-70.8,61.3,-61.8C75.4,-52.7,89.3,-41.4,92.8,-28.5C96.4,-15.5,89.6,-0.9,84.2,14.9C78.8,30.8,74.7,47.8,64.1,59.5C53.6,71.3,36.6,77.8,19.8,77.7C3.1,77.7,-13.3,71.1,-28.5,64C-43.8,56.9,-57.8,49.2,-68.4,37.8C-79,26.4,-86.1,11.3,-86.5,-3.9C-86.8,-19.1,-80.4,-34.6,-69.2,-44.4C-58,-54.2,-41.9,-58.3,-27.6,-66.4C-13.3,-74.5,-0.7,-86.5,8.8,-84.9C18.3,-83.2,24.5,-68,37.6,-60.3C50.6,-52.7,70.4,-52.5,82.9,-44.3C95.3,-36,100.4,-19.5,98.1,-4.6C95.8,10.3,86.1,23.9,75.9,35.9C65.8,47.9,55.3,58.2,42.4,65.6C29.5,73,14.7,77.5,0.3,77C-14.1,76.5,-28.2,71.1,-41.9,64.2C-55.6,57.3,-68.8,49,-75.3,37C-81.7,25,-81.3,9.3,-76.4,-3.9C-71.5,-17.1,-62.1,-27.8,-52.1,-38.1C-42.1,-48.4,-31.6,-58.4,-19.4,-65C-7.3,-71.7,6.6,-75.1,18.9,-72.1C31.2,-69.1,42,-59.7,47.1,-61.5Z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default TipsCard;