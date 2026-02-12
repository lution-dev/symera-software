import { Router } from 'express';
import { isAuthenticated } from './supabaseAuth';
import { db } from './db';
import { storage } from './storage';

// Middleware para debugging
const debugMiddleware = (req: any, res: any, next: any) => {
  console.log(`[DEBUG CRONOGRAMA] Acessando rota: ${req.method} ${req.originalUrl}`);
  console.log(`[DEBUG CRONOGRAMA] Usuário autenticado: ${req.user ? req.user.claims.sub : 'Não autenticado'}`);
  next();
};

const router = Router();

// Rota para buscar todos os itens do cronograma de um evento
router.get('/events/:eventId/schedule', debugMiddleware, isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }

    // Verificar se o usuário tem acesso ao evento
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);

    if (!hasAccess) {
      return res.status(403).json({ message: "Você não tem acesso a este evento" });
    }

    // Consulta SQL direta para buscar os itens do cronograma
    const result = await db.execute(`
      SELECT id, event_id, title, description, start_time, location, responsibles, 
             created_at, updated_at
      FROM schedule_items 
      WHERE event_id = ${eventId} 
      ORDER BY start_time
    `);

    // Transformar para o formato esperado pelo frontend
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
    console.error("Erro ao buscar itens do cronograma:", error);
    res.status(500).json({ message: "Falha ao buscar itens do cronograma" });
  }
});

// Rota para adicionar um item ao cronograma
router.post('/events/:eventId/schedule', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inválido" });
    }

    // Verificar se o usuário tem acesso ao evento
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);

    if (!hasAccess) {
      return res.status(403).json({ message: "Você não tem acesso a este evento" });
    }

    const { title, description, startTime, location, responsibles } = req.body;

    // Validação básica
    if (!title || !startTime) {
      return res.status(400).json({
        message: "Título e horário de início são obrigatórios"
      });
    }

    // Inserir diretamente com SQL
    const descVal = description || null;
    const locVal = location || null;
    const respVal = responsibles || null;

    const result = await db.execute(`
      INSERT INTO schedule_items 
        (event_id, title, description, start_time, location, responsibles, created_at, updated_at) 
      VALUES 
        (${eventId}, '${String(title).replace(/'/g, "''")}', ${descVal ? `'${String(descVal).replace(/'/g, "''")}'` : 'NULL'}, '${String(startTime).replace(/'/g, "''")}', ${locVal ? `'${String(locVal).replace(/'/g, "''")}'` : 'NULL'}, ${respVal ? `'${String(respVal).replace(/'/g, "''")}'` : 'NULL'}, NOW(), NOW())
      RETURNING id, event_id, title, description, start_time, location, responsibles, 
                created_at, updated_at
    `);

    // Formatar o resultado para o frontend
    const newItem = result.rows[0] as any;
    const formattedItem = {
      id: newItem.id,
      eventId: newItem.event_id,
      title: newItem.title,
      description: newItem.description,
      startTime: newItem.start_time,
      location: newItem.location,
      responsibles: newItem.responsibles,
      createdAt: newItem.created_at,
      updatedAt: newItem.updated_at
    };

    res.status(201).json(formattedItem);
  } catch (error) {
    console.error("Erro ao adicionar item ao cronograma:", error);
    res.status(500).json({ message: "Falha ao adicionar item ao cronograma" });
  }
});

// Rota para atualizar um item do cronograma
router.put('/schedule/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de item inválido" });
    }

    // Primeiro, buscar o item para verificar a qual evento ele pertence
    const itemResult = await db.execute(`
      SELECT event_id FROM schedule_items WHERE id = ${id}
    `);

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    const eventId = (itemResult.rows[0] as any).event_id as number;

    // Verificar se o usuário tem acesso ao evento
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);

    if (!hasAccess) {
      return res.status(403).json({ message: "Você não tem acesso a este item" });
    }

    const { title, description, startTime, location, responsibles } = req.body;

    // Validação básica
    if (!title || !startTime) {
      return res.status(400).json({
        message: "Título e horário de início são obrigatórios"
      });
    }

    // Atualizar diretamente com SQL
    const descVal = description || null;
    const locVal = location || null;
    const respVal = responsibles || null;

    const result = await db.execute(`
      UPDATE schedule_items 
      SET 
        title = '${String(title).replace(/'/g, "''")}', 
        description = ${descVal ? `'${String(descVal).replace(/'/g, "''")}'` : 'NULL'}, 
        start_time = '${String(startTime).replace(/'/g, "''")}', 
        location = ${locVal ? `'${String(locVal).replace(/'/g, "''")}'` : 'NULL'}, 
        responsibles = ${respVal ? `'${String(respVal).replace(/'/g, "''")}'` : 'NULL'}, 
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, event_id, title, description, start_time, location, responsibles, 
                created_at, updated_at
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Falha ao atualizar o item" });
    }

    // Formatar o resultado para o frontend
    const updatedItem = result.rows[0] as any;
    const formattedItem = {
      id: updatedItem.id,
      eventId: updatedItem.event_id,
      title: updatedItem.title,
      description: updatedItem.description,
      startTime: updatedItem.start_time,
      location: updatedItem.location,
      responsibles: updatedItem.responsibles,
      createdAt: updatedItem.created_at,
      updatedAt: updatedItem.updated_at
    };

    res.json(formattedItem);
  } catch (error) {
    console.error("Erro ao atualizar item do cronograma:", error);
    res.status(500).json({ message: "Falha ao atualizar item do cronograma" });
  }
});

// Rota para excluir um item do cronograma
router.delete('/schedule/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de item inválido" });
    }

    // Primeiro, buscar o item para verificar a qual evento ele pertence
    const itemResult = await db.execute(`
      SELECT event_id FROM schedule_items WHERE id = ${id}
    `);

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    const eventId = (itemResult.rows[0] as any).event_id as number;

    // Verificar se o usuário tem acesso ao evento
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);

    if (!hasAccess) {
      return res.status(403).json({ message: "Você não tem acesso a este item" });
    }

    // Excluir o item
    await db.execute(`
      DELETE FROM schedule_items WHERE id = ${id}
    `);

    res.json({ success: true, message: "Item excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir item do cronograma:", error);
    res.status(500).json({ message: "Falha ao excluir item do cronograma" });
  }
});

export default router;