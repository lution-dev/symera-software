import { Express } from 'express';
import { db } from './db';

// Esta é uma implementação de emergência para garantir que o cronograma funcione
export function setupCronogramaRoute(app: Express) {
  app.get('/api/events/:eventId/cronograma', async (req, res) => {
    try {
      console.log('Iniciando requisição para o cronograma direto');
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inválido" });
      }
      
      // Consulta SQL direta
      const result = await db.execute(`
        SELECT * FROM schedule_items 
        WHERE event_id = $1 
        ORDER BY start_time
      `, [eventId]);
      
      console.log(`Itens encontrados no cronograma: ${result.rows.length}`);
      
      // Transformar os resultados para o formato esperado pelo frontend
      const formattedItems = result.rows.map((item: any) => ({
        id: item.id,
        eventId: item.event_id,
        title: item.title,
        description: item.description,
        startTime: item.start_time,
        location: item.location,
        responsibles: item.responsibles,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      res.json(formattedItems);
    } catch (error) {
      console.error("Erro ao buscar cronograma (rota direta):", error);
      res.status(500).json({ message: "Falha ao buscar itens do cronograma" });
    }
  });
}