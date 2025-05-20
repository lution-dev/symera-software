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
    // Use startDate if available, otherwise fallback to the date field
    const eventStartDate = new Date(eventData.startDate || eventData.date);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log("Gerando checklist para evento:", eventData.name);
    console.log("Tipo de evento:", eventData.type);
    console.log("Dias até o evento:", daysUntilEvent);
    
    // Criar checklist baseado no tipo de evento e nos dias restantes
    const checklist = [];
    
    // Para um evento de moda (lançamento de coleção)
    if (eventData.type === "corporate" && eventData.name.toLowerCase().includes("coleção")) {
      // Tarefas para eventos de lançamento de moda
      
      // Tarefas para fazer com 60+ dias de antecedência
      if (daysUntilEvent > 60) {
        checklist.push({
          title: "Definir conceito da coleção",
          dueDateBefore: daysUntilEvent - 10,
          description: "Finalizar o tema e o conceito geral da coleção primavera",
          priority: "high"
        });
        
        checklist.push({
          title: "Selecionar local para o evento",
          dueDateBefore: daysUntilEvent - 15,
          description: "Confirmar disponibilidade e reservar o local do evento",
          priority: "high"
        });
      }
      
      // Tarefas para fazer com 45+ dias de antecedência
      if (daysUntilEvent > 45) {
        checklist.push({
          title: "Criar lista de convidados VIP",
          dueDateBefore: Math.min(daysUntilEvent - 5, 40),
          description: "Preparar lista de convidados VIP, incluindo celebridades, influenciadores e imprensa",
          priority: "high"
        });
        
        checklist.push({
          title: "Contratar fotógrafo e videógrafo",
          dueDateBefore: Math.min(daysUntilEvent - 5, 40),
          description: "Contratar profissionais para registrar o evento e as peças da coleção",
          priority: "medium"
        });
      }
      
      // Tarefas para fazer com 30+ dias de antecedência
      if (daysUntilEvent > 30) {
        checklist.push({
          title: "Enviar convites para convidados VIP",
          dueDateBefore: Math.min(daysUntilEvent - 5, 25),
          description: "Enviar convites personalizados para os convidados prioritários",
          priority: "high"
        });
        
        checklist.push({
          title: "Contratar serviço de buffet e coquetel",
          dueDateBefore: Math.min(daysUntilEvent - 8, 25),
          description: "Definir menu e contratar serviço de buffet e coquetel para o evento",
          priority: "medium"
        });
      }
      
      // Tarefas para fazer com 15+ dias de antecedência
      if (daysUntilEvent > 15) {
        checklist.push({
          title: "Preparar material de imprensa",
          dueDateBefore: Math.min(daysUntilEvent - 3, 15),
          description: "Preparar release e press kit com informações sobre a coleção",
          priority: "medium"
        });
        
        checklist.push({
          title: "Confirmar presença de modelos",
          dueDateBefore: Math.min(daysUntilEvent - 5, 12),
          description: "Confirmar a presença e o cronograma dos modelos para o showroom",
          priority: "high"
        });
      }
      
      // Tarefas para fazer com 7+ dias de antecedência
      if (daysUntilEvent > 7) {
        checklist.push({
          title: "Realizar ensaio geral",
          dueDateBefore: Math.min(daysUntilEvent - 2, 5),
          description: "Ensaiar apresentação e organização do showroom com a equipe",
          priority: "high"
        });
        
        checklist.push({
          title: "Confirmar presença dos convidados",
          dueDateBefore: Math.min(daysUntilEvent - 1, 5),
          description: "Entrar em contato com os convidados para confirmar presença",
          priority: "medium"
        });
      }
      
      // Tarefas finais (1-7 dias de antecedência)
      checklist.push({
        title: "Preparar decoração do local",
        dueDateBefore: Math.min(daysUntilEvent - 1, 3),
        description: "Montar a decoração e o cenário de acordo com o tema da coleção",
        priority: "medium"
      });
      
      checklist.push({
        title: "Organizar peças da coleção",
        dueDateBefore: Math.min(daysUntilEvent - 1, 2),
        description: "Garantir que todas as peças da coleção estejam prontas e organizadas",
        priority: "high"
      });
      
      checklist.push({
        title: "Revisar checklist final",
        dueDateBefore: 1,
        description: "Revisar todos os preparativos e confirmar que tudo está pronto",
        priority: "high"
      });
    } else {
      // Checklist genérico para eventos corporativos
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
