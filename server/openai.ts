import OpenAI from "openai";

// OpenAI configuration (optional - only used if API key is provided)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Esta função gera um checklist universal para qualquer tipo de evento
// Funciona independente do tipo de evento, adaptando-se às características específicas
export async function generateEventChecklist(eventData: any): Promise<Array<{ title: string, dueDate?: Date, description?: string, priority?: string }>> {
  try {
    const eventStartDate = new Date(eventData.startDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log("Gerando checklist universal para evento:", eventData.name);
    console.log("Tipo de evento:", eventData.type);
    console.log("Dias até o evento:", daysUntilEvent);
    
    const checklist = [];
    
    // Características do evento (independente do tipo)
    const isLargeEvent = (eventData.attendees || 0) >= 100;
    const hasHighBudget = (eventData.budget || 0) >= 20000;
    const hasLocation = !!eventData.location;
    const isWorkshop = eventData.name?.toLowerCase().includes("workshop") || 
                      eventData.description?.toLowerCase().includes("workshop") ||
                      eventData.description?.toLowerCase().includes("intensivo") ||
                      eventData.description?.toLowerCase().includes("aprenda") ||
                      eventData.description?.toLowerCase().includes("curso") ||
                      eventData.description?.toLowerCase().includes("treinamento");
    const isFashionEvent = eventData.name?.toLowerCase().includes("coleção") ||
                          eventData.name?.toLowerCase().includes("moda") ||
                          eventData.name?.toLowerCase().includes("desfile");
    
    // 1. Planejamento inicial (sempre presente)
    checklist.push({
      title: "Definir objetivos e propósito do evento",
      dueDateBefore: Math.min(daysUntilEvent - 3, 45),
      description: "Estabelecer metas claras, público-alvo e resultados esperados",
      priority: "high"
    });
    
    // 2. Local e infraestrutura
    if (!hasLocation) {
      checklist.push({
        title: "Pesquisar e reservar local",
        dueDateBefore: Math.min(daysUntilEvent - 10, 30),
        description: `Encontrar espaço adequado para ${eventData.attendees || "todos"} participantes`,
        priority: "high"
      });
    } else {
      checklist.push({
        title: "Confirmar reserva e preparar espaço",
        dueDateBefore: Math.min(daysUntilEvent - 5, 20),
        description: `Finalizar detalhes com ${eventData.location} e planejar layout`,
        priority: "high"
      });
    }
    
    // 3. Conteúdo específico para workshops/cursos
    if (isWorkshop) {
      checklist.push({
        title: "Preparar conteúdo e material didático",
        dueDateBefore: Math.min(daysUntilEvent - 5, 25),
        description: "Desenvolver apostilas, apresentações e exercícios práticos",
        priority: "high"
      });
      
      checklist.push({
        title: "Testar equipamentos e materiais",
        dueDateBefore: Math.min(daysUntilEvent - 2, 7),
        description: "Verificar som, projeção e materiais necessários",
        priority: "high"
      });
    }
    
    // 4. Específico para eventos de moda
    if (isFashionEvent) {
      checklist.push({
        title: "Definir conceito e tema",
        dueDateBefore: Math.min(daysUntilEvent - 10, 30),
        description: "Finalizar conceito, paleta de cores e tema geral",
        priority: "high"
      });
      
      checklist.push({
        title: "Contratar modelos e equipe de produção",
        dueDateBefore: Math.min(daysUntilEvent - 8, 25),
        description: "Selecionar modelos, fotógrafos e equipe técnica",
        priority: "high"
      });
    }
    
    // 5. Participantes e comunicação (sempre presente)
    checklist.push({
      title: "Criar lista de participantes",
      dueDateBefore: Math.min(daysUntilEvent - 7, 25),
      description: `Desenvolver lista completa para ${eventData.attendees || ""} pessoas`,
      priority: "high"
    });
    
    checklist.push({
      title: "Criar e enviar convites",
      dueDateBefore: Math.min(daysUntilEvent - 5, 20),
      description: "Desenvolver convites e sistema de confirmação",
      priority: "high"
    });
    
    checklist.push({
      title: "Criar estratégia de divulgação",
      dueDateBefore: Math.min(daysUntilEvent - 10, 15),
      description: "Planejar marketing digital e redes sociais",
      priority: "medium"
    });
    
    // 6. Fornecedores e serviços
    if (eventData.budget && eventData.budget > 1000) {
      checklist.push({
        title: "Organizar alimentação e bebidas",
        dueDateBefore: Math.min(daysUntilEvent - 5, 15),
        description: "Contratar catering ou organizar coffee break",
        priority: "medium"
      });
    }
    
    checklist.push({
      title: "Contratar serviços audiovisuais",
      dueDateBefore: Math.min(daysUntilEvent - 8, 20),
      description: "Garantir som, iluminação e equipamentos necessários",
      priority: hasHighBudget || isLargeEvent ? "high" : "medium"
    });
    
    // 7. Equipe e suporte (para eventos grandes)
    if (isLargeEvent) {
      checklist.push({
        title: "Organizar equipe de apoio",
        dueDateBefore: Math.min(daysUntilEvent - 5, 15),
        description: "Definir recepção, controle de acesso e suporte",
        priority: "medium"
      });
      
      checklist.push({
        title: "Sistema de credenciamento",
        dueDateBefore: Math.min(daysUntilEvent - 3, 10),
        description: "Configurar processo de entrada e identificação",
        priority: "medium"
      });
    }
    
    // 8. Preparação final (sempre presente)
    checklist.push({
      title: "Confirmar presença dos participantes",
      dueDateBefore: Math.min(daysUntilEvent - 2, 5),
      description: "Fazer follow-up final e organizar lista de confirmados",
      priority: "medium"
    });
    
    checklist.push({
      title: "Preparar materiais do evento",
      dueDateBefore: 1,
      description: "Organizar crachás, kits e materiais de distribuição",
      priority: "high"
    });
    
    checklist.push({
      title: "Revisar logística final",
      dueDateBefore: 1,
      description: "Verificar todos os detalhes e preparativos finais",
      priority: "high"
    });
    
    // 9. Pós-evento (sempre presente)
    checklist.push({
      title: "Coletar feedback dos participantes",
      dueDateBefore: -2, // 2 dias após o evento
      description: "Enviar formulário de avaliação e coletar sugestões",
      priority: "medium"
    });
    
    // Converter dueDateBefore em dates reais
    const formattedChecklist = checklist.map(item => {
      let dueDate: Date | undefined;
      
      if (item.dueDateBefore > 0) {
        // Antes do evento
        dueDate = new Date(eventStartDate);
        dueDate.setDate(dueDate.getDate() - item.dueDateBefore);
      } else if (item.dueDateBefore < 0) {
        // Após o evento
        dueDate = new Date(eventStartDate);
        dueDate.setDate(dueDate.getDate() + Math.abs(item.dueDateBefore));
      } else {
        // No dia do evento
        dueDate = new Date(eventStartDate);
      }
      
      return {
        title: item.title,
        description: item.description,
        dueDate,
        priority: item.priority
      };
    });
    
    console.log(`Checklist gerado com ${formattedChecklist.length} tarefas`);
    return formattedChecklist;
    
  } catch (error) {
    console.error("Erro ao gerar checklist:", error);
    return [];
  }
}