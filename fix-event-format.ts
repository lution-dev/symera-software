import { db } from './server/db';
import { events } from './shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Este script corrige o problema com o formato do evento
 * aplicando diretamente a alteração no banco de dados e limpando o cache
 */
async function fixEventFormat() {
  try {
    // Obter o ID do evento a corrigir
    const eventId = 9; // ID do evento Workshop de Marketing Digital
    
    // Verificar o formato atual
    const [currentEvent] = await db.select().from(events).where(eq(events.id, eventId));
    console.log('Formato atual:', currentEvent.format);
    
    // Atualizar para o formato correto
    const [updatedEvent] = await db
      .update(events)
      .set({
        format: 'online', // Forçar o formato para 'online'
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId))
      .returning();
    
    console.log('Evento atualizado com formato:', updatedEvent.format);
    console.log('Atualização concluída com sucesso!');
    
  } catch (error) {
    console.error('Erro ao corrigir formato do evento:', error);
  }
}

// Executar a função
fixEventFormat();