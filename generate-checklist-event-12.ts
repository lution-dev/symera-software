import { db } from "./server/db";
import { events, tasks, taskAssignees } from "./shared/schema";
import { eq } from "drizzle-orm";
import { generateEventChecklist } from "./server/openai";

async function generateChecklistForEvent12() {
  try {
    console.log("Buscando dados do evento 12...");
    
    // Buscar o evento 12
    const event = await db.select().from(events).where(eq(events.id, 12)).limit(1);
    
    if (!event || event.length === 0) {
      console.log("Evento 12 não encontrado");
      return;
    }
    
    const eventData = event[0];
    console.log("Evento encontrado:", eventData.name);
    console.log("Tipo:", eventData.type);
    console.log("Data:", eventData.startDate);
    console.log("Local:", eventData.location);
    console.log("Participantes:", eventData.attendees);
    console.log("Orçamento:", eventData.budget);
    
    // Verificar se já existem tarefas para este evento
    const existingTasks = await db.select().from(tasks).where(eq(tasks.eventId, 12));
    console.log(`Tarefas existentes: ${existingTasks.length}`);
    
    if (existingTasks.length > 0) {
      console.log("Evento já possui tarefas. Removendo tarefas existentes primeiro...");
      
      // Remover assignees das tarefas existentes
      for (const task of existingTasks) {
        await db.delete(taskAssignees).where(eq(taskAssignees.taskId, task.id));
      }
      
      // Remover as tarefas
      await db.delete(tasks).where(eq(tasks.eventId, 12));
      console.log("Tarefas existentes removidas.");
    }
    
    // Gerar novo checklist usando os dados do evento
    const checklistData = {
      name: eventData.name,
      type: eventData.type,
      startDate: eventData.startDate,
      endDate: eventData.endDate || eventData.startDate,
      location: eventData.location || "",
      description: eventData.description || "",
      budget: eventData.budget || 4000,
      attendees: eventData.attendees || 100,
      generateAIChecklist: true
    };
    
    console.log("Gerando checklist com dados:", checklistData);
    
    const checklistItems = await generateEventChecklist(checklistData);
    console.log(`Checklist gerado com ${checklistItems.length} itens`);
    
    if (checklistItems.length === 0) {
      console.log("Nenhum item de checklist foi gerado. Verificando lógica...");
      return;
    }
    
    // Criar tarefas a partir do checklist
    const userId = "8650891"; // ID do usuário proprietário
    
    for (const item of checklistItems) {
      console.log(`Criando tarefa: ${item.title}`);
      
      // Criar a tarefa
      const [newTask] = await db.insert(tasks).values({
        title: item.title,
        description: item.description || "",
        dueDate: item.dueDate,
        priority: (item.priority as any) || 'medium',
        status: 'todo',
        eventId: 12,
        assigneeId: userId
      }).returning();
      
      // Adicionar o assignee
      await db.insert(taskAssignees).values({
        taskId: newTask.id,
        userId: userId
      });
      
      console.log(`✓ Tarefa criada: ${item.title}`);
    }
    
    console.log(`\n✅ Checklist gerado com sucesso!`);
    console.log(`${checklistItems.length} tarefas criadas para o evento "${eventData.name}"`);
    
  } catch (error) {
    console.error("Erro ao gerar checklist:", error);
  }
}

generateChecklistForEvent12();