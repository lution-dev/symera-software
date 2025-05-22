import { db } from './server/db';
import { taskAssignees, tasks, users } from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function addTestAssignees() {
  try {
    console.log('Iniciando a adição de responsáveis às tarefas para testes...');
    
    // Criar usuários de teste primeiro (se ainda não existirem)
    const testUsers = [
      {
        id: '8650891', // Usuário principal (já existe)
        email: 'applution@gmail.com', // Vamos manter o email do usuário principal
        firstName: 'Lucas Pires',
        lastName: '@ Lution'
      },
      {
        id: '999001',
        email: 'joao@exemplo.com',
        firstName: 'João',
        lastName: 'Silva',
        profileImageUrl: 'https://ui-avatars.com/api/?name=João+Silva&background=random',
        phone: '+55 11 91234-5678'
      },
      {
        id: '999002',
        email: 'maria@exemplo.com',
        firstName: 'Maria',
        lastName: 'Santos',
        profileImageUrl: 'https://ui-avatars.com/api/?name=Maria+Santos&background=random',
        phone: '+55 11 98765-4321'
      },
      {
        id: '999003',
        email: 'carlos@exemplo.com',
        firstName: 'Carlos',
        lastName: 'Oliveira',
        profileImageUrl: 'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=random',
        phone: '+55 11 97777-8888'
      }
    ];
    
    // Criar usuários de teste (exceto o principal que já deve existir)
    for (const user of testUsers.slice(1)) {
      try {
        // Verificar se o usuário já existe
        const existingUser = await db.select().from(users).where(eq(users.id, user.id));
        
        if (existingUser.length === 0) {
          // Criar o usuário
          await db.insert(users).values({
            ...user,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log(`Usuário ${user.firstName} ${user.lastName} (${user.id}) criado com sucesso`);
        } else {
          console.log(`Usuário ${user.id} já existe, pulando criação`);
        }
      } catch (error) {
        console.error(`Erro ao criar usuário ${user.id}:`, error);
      }
    }
    
    // Buscar todas as tarefas no banco de dados
    const allTasks = await db.select().from(tasks);
    console.log(`Encontradas ${allTasks.length} tarefas no banco de dados`);
    
    // IDs dos usuários de teste que criamos
    const userIds = testUsers.map(user => user.id);
    
    // Para cada tarefa, adicionar 2-3 responsáveis
    let assigneesAdded = 0;
    
    for (const task of allTasks) {
      // Selecionar 2 ou 3 usuários aleatoriamente
      const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, Math.floor(Math.random() * 2) + 2); // 2 ou 3 usuários
      
      // Sempre incluir o assigneeId original (se existir) como um dos responsáveis
      if (task.assigneeId && !selectedUsers.includes(task.assigneeId)) {
        selectedUsers[0] = task.assigneeId;
      }
      
      // Adicionar cada usuário como responsável pela tarefa
      for (const userId of selectedUsers) {
        try {
          // Verificar se já existe este responsável para esta tarefa
          const existingAssignee = await db
            .select()
            .from(taskAssignees)
            .where(eq(taskAssignees.taskId, task.id))
            .where(eq(taskAssignees.userId, userId));
          
          // Se não existir, adicionar
          if (existingAssignee.length === 0) {
            await db.insert(taskAssignees).values({
              taskId: task.id,
              userId: userId,
              createdAt: new Date()
            });
            
            assigneesAdded++;
            console.log(`Adicionado responsável ${userId} para a tarefa ${task.id} (${task.title})`);
          } else {
            console.log(`Responsável ${userId} já existe para tarefa ${task.id}`);
          }
        } catch (error) {
          console.error(`Erro ao adicionar responsável ${userId} para tarefa ${task.id}:`, error);
        }
      }
    }
    
    console.log(`Processo concluído! Adicionados ${assigneesAdded} responsáveis às tarefas.`);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar responsáveis às tarefas:', error);
    process.exit(1);
  }
}

// Executar a função
addTestAssignees();