import { db } from "./server/db";
import { events } from "./shared/schema";
import { eq } from "drizzle-orm";

async function migrateEventDates() {
  try {
    console.log("Iniciando migração de datas nos eventos...");
    
    // Buscar todos os eventos
    const allEvents = await db.query.events.findMany();
    console.log(`Encontrados ${allEvents.length} eventos para migrar.`);
    
    for (const event of allEvents) {
      console.log(`Processando evento ${event.id} - ${event.name}`);
      
      // Garantir que todos os eventos tenham startDate e endDate válidos
      let startDateValue = event.startDate;
      let endDateValue = event.endDate;
      let startTimeValue = event.startTime || "19:00";
      let endTimeValue = event.endTime || "23:00";
      
      // Se não tiver startDate, usar o campo 'date'
      if (!startDateValue) {
        startDateValue = event.date;
        console.log(`- Usando date como startDate para evento ${event.id}`);
      }
      
      // Se não tiver endDate, usar o mesmo que startDate
      if (!endDateValue) {
        endDateValue = startDateValue;
        console.log(`- Usando startDate como endDate para evento ${event.id}`);
      }
      
      // Atualizar o evento com os valores corrigidos
      await db.update(events)
        .set({
          startDate: startDateValue,
          endDate: endDateValue,
          startTime: startTimeValue,
          endTime: endTimeValue
        })
        .where(eq(events.id, event.id));
        
      console.log(`Evento ${event.id} migrado com sucesso.`);
    }
    
    console.log("Migração de datas concluída com sucesso!");
    
    // Agora seria necessário usar uma migração SQL para remover a coluna 'date'
    console.log("Próximo passo: execute uma migração SQL para remover a coluna 'date'");
    console.log("Exemplo de SQL: ALTER TABLE events DROP COLUMN date;");
    
  } catch (error) {
    console.error("Erro ao migrar datas dos eventos:", error);
  }
}

// Executar a função
migrateEventDates();