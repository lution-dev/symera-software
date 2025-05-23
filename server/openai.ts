import OpenAI from "openai";
import { CreateEventData } from "@shared/schema";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Error handling function
const handleOpenAIError = (error: any) => {
  console.error("OpenAI API Error:", error);
  if (error.response) {
    console.error(error.response.status, error.response.data);
    throw new Error(`OpenAI API error: ${error.response.status}`);
  } else {
    throw new Error(`OpenAI API error: ${error.message || "Unknown error"}`);
  }
};

// Generate a checklist for an event based on its details
// Esta é uma versão alternativa que não depende da OpenAI API
export async function generateEventChecklist(eventData: CreateEventData): Promise<Array<{ title: string, dueDate?: Date, description?: string, priority?: string }>> {
  try {
    // Use startDate which is now required
    const eventStartDate = new Date(eventData.startDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log("Gerando checklist para evento:", eventData.name);
    console.log("Tipo de evento:", eventData.type);
    console.log("Dias até o evento:", daysUntilEvent);
    console.log("Orçamento:", eventData.budget);
    console.log("Número de convidados:", eventData.attendees);
    console.log("Local:", eventData.location);
    
    // Criar checklist baseado no tipo de evento e nos dias restantes
    const checklist = [];
    
    // Para um evento de moda (lançamento de coleção)
    if (eventData.type === "corporate" && eventData.name.toLowerCase().includes("coleção")) {
      // Obter informações específicas
      const isLargeEvent = (eventData.attendees || 0) >= 100;
      const hasHighBudget = (eventData.budget || 0) >= 20000;
      const hasLocation = !!eventData.location;
      
      // Adicionar tarefas de planejamento geral
      checklist.push({
        title: "Definir conceito e tema da coleção",
        dueDateBefore: Math.min(daysUntilEvent - 5, 90),
        description: "Finalizar o tema, paleta de cores e conceito geral da coleção primavera",
        priority: "high"
      });
      
      // Tarefas relacionadas ao local
      if (!hasLocation) {
        checklist.push({
          title: "Selecionar e reservar local para o evento",
          dueDateBefore: Math.min(daysUntilEvent - 15, 75),
          description: "Pesquisar, visitar e reservar um local adequado que comporte " + (eventData.attendees || "todos os convidados"),
          priority: "high"
        });
      } else {
        checklist.push({
          title: "Confirmar reserva do local",
          dueDateBefore: Math.min(daysUntilEvent - 10, 60),
          description: `Confirmar todos os detalhes da reserva em ${eventData.location}`,
          priority: "high"
        });
        
        checklist.push({
          title: "Visitar o local para planejamento",
          dueDateBefore: Math.min(daysUntilEvent - 8, 50),
          description: `Verificar layout, estrutura elétrica, iluminação e espaços para desfile em ${eventData.location}`,
          priority: "medium"
        });
      }
      
      // Tarefas relacionadas aos convidados
      checklist.push({
        title: "Desenvolver lista de convidados VIP",
        dueDateBefore: Math.min(daysUntilEvent - 5, 60),
        description: `Preparar lista segmentada (imprensa, celebridades, influenciadores, compradores) para os ${eventData.attendees || "convidados"} do evento`,
        priority: "high"
      });
      
      if (isLargeEvent) {
        checklist.push({
          title: "Contratar equipe de recepção",
          dueDateBefore: Math.min(daysUntilEvent - 10, 40),
          description: `Contratar equipe para recepção, credenciamento e atendimento aos ${eventData.attendees} convidados`,
          priority: "medium"
        });
        
        checklist.push({
          title: "Implementar sistema de credenciamento",
          dueDateBefore: Math.min(daysUntilEvent - 15, 30),
          description: "Configurar sistema digital ou impresso para credenciamento eficiente dos convidados",
          priority: "medium"
        });
      }
      
      // Tarefas de produção e logística
      checklist.push({
        title: "Contratar fotógrafo e videógrafo",
        dueDateBefore: Math.min(daysUntilEvent - 5, 45),
        description: "Contratar profissionais para registro completo: backstage, desfile e relacionamento com convidados",
        priority: "high"
      });
      
      checklist.push({
        title: "Definir equipe de modelos",
        dueDateBefore: Math.min(daysUntilEvent - 8, 40),
        description: "Selecionar e contratar modelos para apresentação da coleção",
        priority: "high"
      });
      
      checklist.push({
        title: "Planejar sequência do desfile",
        dueDateBefore: Math.min(daysUntilEvent - 5, 30),
        description: "Organizar a ordem de apresentação das peças, música e coreografia",
        priority: "medium"
      });
      
      // Tarefas de alimentação - baseado no orçamento
      if (hasHighBudget) {
        checklist.push({
          title: "Contratar serviço de buffet premium",
          dueDateBefore: Math.min(daysUntilEvent - 20, 45),
          description: `Definir menu gourmet e contratar serviço de buffet e coquetel para ${eventData.attendees || ""} pessoas`,
          priority: "high"
        });
        
        checklist.push({
          title: "Planejar serviço de bar e bebidas",
          dueDateBefore: Math.min(daysUntilEvent - 15, 30),
          description: "Selecionar vinhos, champagnes e drinks especiais para o evento",
          priority: "medium"
        });
      } else {
        checklist.push({
          title: "Contratar serviço de coquetel",
          dueDateBefore: Math.min(daysUntilEvent - 15, 30),
          description: `Definir menu de finger foods e bebidas para ${eventData.attendees || ""} pessoas`,
          priority: "medium"
        });
      }
      
      // Tarefas de marketing e comunicação
      checklist.push({
        title: "Desenvolver estratégia de divulgação",
        dueDateBefore: Math.min(daysUntilEvent - 10, 60),
        description: "Criar plano de comunicação para antes, durante e após o evento",
        priority: "high"
      });
      
      checklist.push({
        title: "Preparar press kit e material de imprensa",
        dueDateBefore: Math.min(daysUntilEvent - 5, 25),
        description: "Elaborar release, lookbook digital, fotos das peças e informações sobre a coleção",
        priority: "high"
      });
      
      checklist.push({
        title: "Enviar convites personalizados",
        dueDateBefore: Math.min(daysUntilEvent - 5, 30),
        description: "Enviar convites físicos ou digitais para todos os convidados",
        priority: "high"
      });
      
      checklist.push({
        title: "Configurar espaço para mídia",
        dueDateBefore: Math.min(daysUntilEvent - 3, 15),
        description: "Preparar área para entrevistas, backdrop para fotos e espaço dedicado para imprensa",
        priority: "medium"
      });
      
      // Tarefas para semana anterior
      checklist.push({
        title: "Realizar ensaio geral",
        dueDateBefore: Math.min(daysUntilEvent - 2, 7),
        description: "Conduzir ensaio completo com modelos, música, iluminação e toda a equipe",
        priority: "high"
      });
      
      checklist.push({
        title: "Confirmar presença dos convidados VIP",
        dueDateBefore: Math.min(daysUntilEvent - 1, 5),
        description: "Fazer follow-up final com convidados prioritários",
        priority: "medium"
      });
      
      // Tarefas para os dias finais
      checklist.push({
        title: "Montar a decoração e cenografia",
        dueDateBefore: Math.min(daysUntilEvent - 1, 3),
        description: "Implementar decoração, iluminação e cenário alinhados ao tema da coleção",
        priority: "high"
      });
      
      checklist.push({
        title: "Preparar área de backstage",
        dueDateBefore: Math.min(daysUntilEvent - 1, 2),
        description: "Organizar espaço para modelos, maquiagem, cabelo e peças da coleção",
        priority: "high"
      });
      
      checklist.push({
        title: "Organizar peças da coleção",
        dueDateBefore: Math.min(daysUntilEvent - 1, 2),
        description: "Finalizar organização do acervo, etiquetagem e sequência de apresentação",
        priority: "high"
      });
      
      checklist.push({
        title: "Preparar press kits físicos",
        dueDateBefore: Math.min(daysUntilEvent - 1, 2),
        description: "Montar kits de imprensa para distribuição no dia do evento",
        priority: "medium"
      });
      
      checklist.push({
        title: "Testar equipamentos técnicos",
        dueDateBefore: 1,
        description: "Verificar som, iluminação, projeções e todos os equipamentos técnicos",
        priority: "high"
      });
      
      checklist.push({
        title: "Briefing final com a equipe",
        dueDateBefore: 1,
        description: "Reunir toda a equipe para instruções finais e alinhamento",
        priority: "high"
      });
      
      // Tarefas pós-evento
      checklist.push({
        title: "Enviar agradecimentos aos convidados",
        dueDateBefore: -2, // 2 dias após o evento
        description: "Enviar mensagens de agradecimento e material digital sobre a coleção",
        priority: "medium"
      });
      
      checklist.push({
        title: "Compilar cobertura de mídia",
        dueDateBefore: -5, // 5 dias após o evento
        description: "Reunir publicações, fotos e vídeos do evento para relatório",
        priority: "medium"
      });
      
    } else if (eventData.type === "corporate") {
      // Checklist mais detalhado para eventos corporativos
      const isLargeEvent = (eventData.attendees || 0) >= 100;
      const hasHighBudget = (eventData.budget || 0) >= 20000;
      const hasLocation = !!eventData.location;
      
      // Planejamento inicial
      checklist.push({
        title: "Definir objetivos e métricas do evento",
        dueDateBefore: Math.min(daysUntilEvent - 5, 90),
        description: "Estabelecer metas claras, KPIs e resultados esperados do evento",
        priority: "high"
      });
      
      checklist.push({
        title: "Desenvolver cronograma detalhado",
        dueDateBefore: Math.min(daysUntilEvent - 10, 75),
        description: "Criar timeline com todas as fases do projeto até o dia do evento",
        priority: "high"
      });
      
      checklist.push({
        title: "Definir orçamento detalhado",
        dueDateBefore: Math.min(daysUntilEvent - 10, 70),
        description: `Detalhar alocação do orçamento de R$ ${eventData.budget || "disponível"} por categoria`,
        priority: "high"
      });
      
      // Local do evento
      if (!hasLocation) {
        checklist.push({
          title: "Pesquisar e reservar local",
          dueDateBefore: Math.min(daysUntilEvent - 15, 60),
          description: `Encontrar espaço adequado para ${eventData.attendees || ""} participantes com infraestrutura necessária`,
          priority: "high"
        });
      } else {
        checklist.push({
          title: "Confirmar reserva do local",
          dueDateBefore: Math.min(daysUntilEvent - 10, 45),
          description: `Finalizar contrato e detalhes com ${eventData.location}`,
          priority: "high"
        });
        
        checklist.push({
          title: "Verificar requisitos técnicos do local",
          dueDateBefore: Math.min(daysUntilEvent - 8, 40),
          description: `Inspecionar instalações, conexões e capacidades técnicas em ${eventData.location}`,
          priority: "medium"
        });
      }
      
      // Convidados e programação
      checklist.push({
        title: "Definir programação e agenda",
        dueDateBefore: Math.min(daysUntilEvent - 5, 60),
        description: "Estruturar cronograma do evento com palestrantes, atividades e intervalos",
        priority: "high"
      });
      
      checklist.push({
        title: "Convidar palestrantes e apresentadores",
        dueDateBefore: Math.min(daysUntilEvent - 10, 55),
        description: "Contatar e confirmar todos os participantes do programa",
        priority: "high"
      });
      
      checklist.push({
        title: "Criar lista de convidados e participantes",
        dueDateBefore: Math.min(daysUntilEvent - 5, 45),
        description: `Desenvolver e segmentar lista para os ${eventData.attendees || ""} participantes`,
        priority: "high"
      });
      
      // Fornecedores e serviços
      checklist.push({
        title: "Contratar serviços audiovisuais",
        dueDateBefore: Math.min(daysUntilEvent - 15, 50),
        description: "Garantir equipamentos de som, projeção, iluminação e gravação",
        priority: "high"
      });
      
      if (hasHighBudget) {
        checklist.push({
          title: "Contratar serviço de alimentação premium",
          dueDateBefore: Math.min(daysUntilEvent - 20, 45),
          description: `Definir menu completo para ${eventData.attendees || ""} pessoas, incluindo opções para restrições alimentares`,
          priority: "high"
        });
      } else {
        checklist.push({
          title: "Organizar serviço de alimentação",
          dueDateBefore: Math.min(daysUntilEvent - 15, 40),
          description: `Definir coffee breaks, água e alimentação básica para ${eventData.attendees || ""} pessoas`,
          priority: "medium"
        });
      }
      
      if (isLargeEvent) {
        checklist.push({
          title: "Planejar sistema de credenciamento",
          dueDateBefore: Math.min(daysUntilEvent - 10, 35),
          description: "Implementar processo eficiente para registro e entrada de participantes",
          priority: "medium"
        });
        
        checklist.push({
          title: "Contratar equipe de apoio",
          dueDateBefore: Math.min(daysUntilEvent - 15, 30),
          description: "Recrutar pessoal para recepção, orientação e suporte técnico",
          priority: "medium"
        });
      }
      
      // Marketing e comunicação
      checklist.push({
        title: "Desenvolver identidade visual do evento",
        dueDateBefore: Math.min(daysUntilEvent - 10, 60),
        description: "Criar logo, materiais gráficos e template para apresentações",
        priority: "medium"
      });
      
      checklist.push({
        title: "Preparar estratégia de comunicação",
        dueDateBefore: Math.min(daysUntilEvent - 10, 55),
        description: "Planejar divulgação antes, durante e após o evento",
        priority: "medium"
      });
      
      checklist.push({
        title: "Enviar convites e informações",
        dueDateBefore: Math.min(daysUntilEvent - 5, 30),
        description: "Distribuir convites oficiais com programação e informações práticas",
        priority: "high"
      });
      
      // Tecnologia
      checklist.push({
        title: "Configurar plataformas digitais",
        dueDateBefore: Math.min(daysUntilEvent - 15, 30),
        description: "Preparar aplicativo do evento, site ou plataforma de interação",
        priority: "medium"
      });
      
      checklist.push({
        title: "Testar conexão internet e equipamentos",
        dueDateBefore: Math.min(daysUntilEvent - 5, 15),
        description: "Verificar banda larga, conexões e todos os recursos tecnológicos",
        priority: "high"
      });
      
      // Semana do evento
      checklist.push({
        title: "Confirmar presença de todos os participantes",
        dueDateBefore: Math.min(daysUntilEvent - 3, 7),
        description: "Fazer contato final com convidados, palestrantes e fornecedores",
        priority: "high"
      });
      
      checklist.push({
        title: "Preparar materiais dos participantes",
        dueDateBefore: Math.min(daysUntilEvent - 2, 5),
        description: "Organizar crachás, kits, brindes e materiais informativos",
        priority: "medium"
      });
      
      checklist.push({
        title: "Realizar ensaio técnico",
        dueDateBefore: Math.min(daysUntilEvent - 1, 3),
        description: "Testar apresentações, equipamentos e cronometragem",
        priority: "high"
      });
      
      // Dia do evento
      checklist.push({
        title: "Montar estrutura e sinalização",
        dueDateBefore: 1,
        description: "Organizar ambiente, decoração e sinalização do evento",
        priority: "high"
      });
      
      checklist.push({
        title: "Briefing final com equipe",
        dueDateBefore: 1,
        description: "Reunir todos os envolvidos para alinhamento final",
        priority: "high"
      });
      
      // Pós-evento
      checklist.push({
        title: "Enviar agradecimentos e materiais",
        dueDateBefore: -2, // 2 dias após o evento
        description: "Distribuir agradecimentos, apresentações e conteúdos aos participantes",
        priority: "medium"
      });
      
      checklist.push({
        title: "Avaliar resultados e métricas",
        dueDateBefore: -7, // 7 dias após o evento
        description: "Analisar feedback, participação e retorno sobre investimento",
        priority: "high"
      });
      
    } else {
      // Checklist genérico para outros tipos de eventos
      checklist.push({
        title: "Definir objetivos do evento",
        dueDateBefore: Math.min(daysUntilEvent - 5, 60),
        description: "Estabelecer metas claras e mensuráveis para o evento",
        priority: "high"
      });
      
      checklist.push({
        title: "Reservar local do evento",
        dueDateBefore: Math.min(daysUntilEvent - 8, 45),
        description: "Pesquisar e reservar um local adequado para o evento",
        priority: "high"
      });
      
      checklist.push({
        title: "Criar lista de convidados",
        dueDateBefore: Math.min(daysUntilEvent - 5, 40),
        description: "Desenvolver lista completa de convidados e participantes",
        priority: "medium"
      });
      
      checklist.push({
        title: "Contratar fornecedores",
        dueDateBefore: Math.min(daysUntilEvent - 10, 30),
        description: "Contratar serviços de catering, áudio/visual e decoração",
        priority: "high"
      });
      
      checklist.push({
        title: "Enviar convites",
        dueDateBefore: Math.min(daysUntilEvent - 5, 25),
        description: "Criar e enviar convites para todos os participantes",
        priority: "high"
      });
      
      checklist.push({
        title: "Preparar material promocional",
        dueDateBefore: Math.min(daysUntilEvent - 8, 20),
        description: "Desenvolver materiais de marketing e promocionais",
        priority: "medium"
      });
      
      checklist.push({
        title: "Confirmar presença dos convidados",
        dueDateBefore: Math.min(daysUntilEvent - 3, 7),
        description: "Fazer follow-up com os convidados para confirmar presença",
        priority: "medium"
      });
      
      checklist.push({
        title: "Revisar logística final",
        dueDateBefore: 2,
        description: "Revisar todos os detalhes logísticos e preparativos finais",
        priority: "high"
      });
    }
    
    // Process checklist and calculate actual due dates
    return checklist.map((task: any) => {
      // Calculate due date based on days before event
      let dueDate: Date | undefined = undefined;
      if (typeof task.dueDateBefore === 'number') {
        // Use eventStartDate para calcular a data de vencimento das tarefas
        dueDate = new Date(eventStartDate);
        dueDate.setDate(dueDate.getDate() - task.dueDateBefore);
      }

      return {
        title: task.title,
        dueDate: dueDate,
        description: task.description,
        priority: task.priority?.toLowerCase() || 'medium'
      };
    });
  } catch (error) {
    console.error("Erro ao gerar checklist:", error);
    return [];
  }
}
