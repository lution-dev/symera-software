// Script para adicionar membros à equipe do evento "Lançamento Coleção Primavera 2025"
import { db } from './server/db';
import { eventTeamMembers } from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function addTeamMembers() {
  try {
    console.log('Adicionando membros à equipe do evento Lançamento Coleção Primavera 2025...');
    
    // ID do evento "Lançamento Coleção Primavera 2025"
    const eventId = 10;
    
    // Membros para adicionar
    const teamMembers = [
      {
        eventId: eventId,
        userId: '999001', // João Silva
        role: 'team_member',
        permissions: {
          canEdit: true,
          canDelete: false, 
          canInvite: false
        }
      },
      {
        eventId: eventId,
        userId: '999002', // Maria Santos
        role: 'team_member',
        permissions: {
          canEdit: true,
          canDelete: true,
          canInvite: true
        }
      },
      {
        eventId: eventId,
        userId: '999003', // Carlos Oliveira
        role: 'team_member',
        permissions: {
          canEdit: true,
          canDelete: false,
          canInvite: false
        }
      }
    ];
    
    // Adicionar cada membro à equipe
    for (const member of teamMembers) {
      try {
        // Verificar se já existe na equipe
        const existing = await db.select()
          .from(eventTeamMembers)
          .where(and(
            eq(eventTeamMembers.eventId, member.eventId),
            eq(eventTeamMembers.userId, member.userId)
          ));
        
        if (existing.length === 0) {
          // Inserir membro na equipe
          await db.insert(eventTeamMembers).values({
            eventId: member.eventId,
            userId: member.userId,
            role: member.role,
            permissions: member.permissions,
            createdAt: new Date()
          });
          
          console.log(`Adicionado usuário ${member.userId} como ${member.role} à equipe do evento ${eventId}`);
        } else {
          console.log(`Usuário ${member.userId} já é membro da equipe do evento ${eventId}`);
        }
      } catch (error) {
        console.error(`Erro ao adicionar membro ${member.userId}:`, error);
      }
    }
    
    console.log('Adição de membros à equipe concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar membros à equipe:', error);
    process.exit(1);
  }
}

// Executar a função
addTeamMembers();