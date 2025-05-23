import { db } from "./server/db";
import { events } from "./shared/schema";
import { eq } from "drizzle-orm";

async function updateEventDates() {
  try {
    console.log("Iniciando atualização de datas nos eventos...");
    
    // Buscar todos os eventos
    const allEvents = await db.query.events.findMany();
    console.log(`Encontrados ${allEvents.length} eventos para atualizar.`);
    
    for (const event of allEvents) {
      // Se o evento só tem date mas não tem startDate e endDate
      if (event.date && (!event.startDate || !event.endDate)) {
        console.log(`Atualizando evento ${event.id} - ${event.name}`);
        
        // Atualizar o evento para usar date como startDate e endDate
        await db.update(events)
          .set({
            startDate: event.date,
            endDate: event.date,
            startTime: event.startTime || "19:00",
            endTime: event.endTime || "23:00"
          })
          .where(eq(events.id, event.id));
          
        console.log(`Evento ${event.id} atualizado com sucesso.`);
      } else {
        console.log(`Evento ${event.id} já possui startDate e endDate.`);
      }
    }
    
    console.log("Atualização de datas concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar datas dos eventos:", error);
  }
}

// Executar a função
updateEventDates();