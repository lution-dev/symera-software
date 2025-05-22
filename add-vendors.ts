// Script para adicionar responsáveis específicos para cada tarefa do lançamento
import { db } from './server/db';
import { taskAssignees, tasks } from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function addVendors() {
  try {
    console.log('Atualizando responsáveis das tarefas no evento "Lançamento Coleção Primavera 2025"...');
    
    // ID do evento
    const eventId = 10;
    
    // Lista de IDs de usuários disponíveis
    const userIds = [
      '8650891', // Lucas (Organizador principal)
      '999001', // João (Designer)
      '999002', // Maria (Coordenadora)
      '999003'  // Carlos (Assistente)
    ];
    
    // Primeiro, vamos limpar os responsáveis existentes
    // Buscando tarefas do evento específico
    const eventTasks = await db.select()
      .from(tasks)
      .where(eq(tasks.eventId, eventId));
    
    console.log(`Encontradas ${eventTasks.length} tarefas no evento ${eventId}`);
    
    // Para cada tarefa, vamos definir responsáveis específicos
    for (const task of eventTasks) {
      try {
        // Remover todos os responsáveis atuais da tarefa
        await db.delete(taskAssignees)
          .where(eq(taskAssignees.taskId, task.id));
        
        console.log(`Removidos todos os responsáveis da tarefa ${task.id} (${task.title})`);
        
        // Agora vamos adicionar responsáveis específicos para cada tarefa
        // Vamos variar os responsáveis com base no título da tarefa ou ID
        
        let selectedResponsibles = [];
        
        // Tarefas mais técnicas - para o fotógrafo (Carlos)
        if (task.title.toLowerCase().includes('equipamento') || 
            task.title.toLowerCase().includes('técnico') || 
            task.title.toLowerCase().includes('testar')) {
          selectedResponsibles = [userIds[0], userIds[3]]; // Lucas e Carlos
        }
        // Tarefas de design e decoração - para o designer (João)
        else if (task.title.toLowerCase().includes('decoração') || 
                task.title.toLowerCase().includes('visual') || 
                task.title.toLowerCase().includes('coleção') ||
                task.title.toLowerCase().includes('layout')) {
          selectedResponsibles = [userIds[0], userIds[1]]; // Lucas e João
        }
        // Tarefas de coordenação e gerenciamento - para coordenadora (Maria)
        else if (task.title.toLowerCase().includes('confirmar') || 
                task.title.toLowerCase().includes('revisar') || 
                task.title.toLowerCase().includes('coordenar') ||
                task.title.toLowerCase().includes('checklist')) {
          selectedResponsibles = [userIds[0], userIds[2]]; // Lucas e Maria
        }
        // Tarefas importantes - toda a equipe
        else if (task.title.toLowerCase().includes('reunião') || 
                task.title.toLowerCase().includes('briefing') || 
                task.title.toLowerCase().includes('planejamento')) {
          selectedResponsibles = userIds; // Todos
        }
        // Padrão - apenas o Lucas (organizador principal)
        else {
          // Para variar, vamos usar o ID da tarefa para determinar quem mais ajuda
          const taskIdLastDigit = task.id % 10;
          
          if (taskIdLastDigit <= 3) {
            selectedResponsibles = [userIds[0], userIds[1]]; // Lucas e João
          } else if (taskIdLastDigit <= 6) {
            selectedResponsibles = [userIds[0], userIds[2]]; // Lucas e Maria
          } else {
            selectedResponsibles = [userIds[0], userIds[3]]; // Lucas e Carlos
          }
        }
        
        // Adicionar os responsáveis selecionados
        for (const userId of selectedResponsibles) {
          await db.insert(taskAssignees).values({
            taskId: task.id,
            userId: userId,
            createdAt: new Date()
          });
          
          console.log(`Adicionado responsável ${userId} para a tarefa ${task.id}`);
        }
        
        // Atualizar a descrição da tarefa para refletir os responsáveis
        let responsibleNames = [];
        if (selectedResponsibles.includes('8650891')) responsibleNames.push('Lucas Pires (principal)');
        if (selectedResponsibles.includes('999001')) responsibleNames.push('João Silva');
        if (selectedResponsibles.includes('999002')) responsibleNames.push('Maria Santos');
        if (selectedResponsibles.includes('999003')) responsibleNames.push('Carlos Oliveira');
        
        const baseDescription = task.description?.split('\n\n**Colaboradores:**')[0] || task.description || '';
        const newDescription = baseDescription + '\n\n**Colaboradores:** ' + responsibleNames.join(', ');
        
        await db.update(tasks)
          .set({ 
            description: newDescription,
            updatedAt: new Date()
          })
          .where(eq(tasks.id, task.id));
        
        console.log(`Atualizada descrição da tarefa ${task.id} com os responsáveis`);
      } catch (error) {
        console.error(`Erro ao atualizar responsáveis da tarefa ${task.id}:`, error);
      }
    }
    
    console.log('Atualização de responsáveis concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar responsáveis das tarefas:', error);
    process.exit(1);
  }
}

// Executar a função
addVendors();