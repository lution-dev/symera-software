// Script para adicionar responsáveis para tarefas
import { db } from './server/db';
import { taskAssignees, tasks } from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function addTaskAssignees() {
  try {
    console.log('Iniciando a adição de responsáveis para tarefas...');
    
    // IDs dos usuários que vamos usar como responsáveis
    const userIds = [
      '8650891',  // Lucas Pires (usuário principal)
      '999001',   // João Silva
      '999002',   // Maria Santos
      '999003'    // Carlos Oliveira
    ];
    
    // Buscar todas as tarefas
    const allTasks = await db.select().from(tasks);
    console.log(`Encontradas ${allTasks.length} tarefas no banco de dados`);
    
    let assigneesAdded = 0;
    
    // Para cada tarefa, adicionar todos os usuários como responsáveis
    for (const task of allTasks) {
      for (const userId of userIds) {
        try {
          // Verificar se a combinação de tarefa e usuário já existe
          const existingAssignees = await db.select().from(taskAssignees)
            .where(and(
              eq(taskAssignees.taskId, task.id),
              eq(taskAssignees.userId, userId)
            ));
          
          // Se não existir, adicionamos
          if (existingAssignees.length === 0) {
            await db.insert(taskAssignees).values({
              taskId: task.id,
              userId: userId,
              createdAt: new Date()
            });
            
            assigneesAdded++;
            console.log(`Adicionado responsável ${userId} para a tarefa ${task.id}`);
          }
        } catch (error) {
          console.error(`Erro ao adicionar responsável ${userId} para tarefa ${task.id}:`, error);
        }
      }
    }
    
    console.log(`Processo concluído! Adicionados ${assigneesAdded} novos responsáveis.`);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar responsáveis para tarefas:', error);
    process.exit(1);
  }
}

// Executar função
addTaskAssignees();