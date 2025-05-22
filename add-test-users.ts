// Script para adicionar usuários de teste ao banco de dados
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function addTestUsers() {
  try {
    console.log('Iniciando a adição de usuários para testes...');
    
    // Usuários de teste para adicionar
    const testUsers = [
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
    
    // Criar cada usuário
    for (const user of testUsers) {
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
    
    console.log('Adição de usuários de teste concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar usuários de teste:', error);
    process.exit(1);
  }
}

// Executar a função
addTestUsers();