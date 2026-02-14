import { Router } from 'express';
import { z } from 'zod';
import { db } from './db';
import { insertScheduleItemSchema, scheduleItems } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from './supabaseAuth';
import { storage } from './storage';

const router = Router();

// Obter todos os itens do cronograma de um evento
router.get('/events/:eventId/schedule', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'ID de evento inválido' });
    }

    // Verificar acesso
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Você não tem acesso a este evento' });
    }

    const items = await db.select().from(scheduleItems).where(eq(scheduleItems.eventId, eventId)).orderBy(scheduleItems.startTime);
    res.json(items);
  } catch (error) {
    console.error('Erro ao buscar itens do cronograma:', error);
    res.status(500).json({ message: 'Erro ao buscar itens do cronograma' });
  }
});

// Obter um item específico do cronograma
router.get('/schedule/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de item inválido' });
    }

    const item = await db.select().from(scheduleItems).where(eq(scheduleItems.id, id));

    if (item.length === 0) {
      return res.status(404).json({ message: 'Item do cronograma não encontrado' });
    }

    // Verificar acesso ao evento pai
    const hasAccess = await storage.hasUserAccessToEvent(userId, item[0].eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Você não tem acesso a este item' });
    }

    res.json(item[0]);
  } catch (error) {
    console.error('Erro ao buscar item do cronograma:', error);
    res.status(500).json({ message: 'Erro ao buscar item do cronograma' });
  }
});

// Criar um novo item no cronograma
router.post('/events/:eventId/schedule', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'ID de evento inválido' });
    }

    // Verificar acesso
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Você não tem acesso a este evento' });
    }

    const validatedData = insertScheduleItemSchema.parse({
      ...req.body,
      eventId
    });

    const newItem = await db.insert(scheduleItems).values(validatedData).returning();

    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Erro ao criar item do cronograma:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos para o item do cronograma',
        errors: error.errors
      });
    }
    res.status(500).json({ message: 'Erro ao criar item do cronograma' });
  }
});

// Atualizar um item do cronograma
router.put('/schedule/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de item inválido' });
    }

    // Verificar existência e acesso
    const existingItem = await db.select().from(scheduleItems).where(eq(scheduleItems.id, id));
    if (existingItem.length === 0) {
      return res.status(404).json({ message: 'Item do cronograma não encontrado' });
    }

    const hasAccess = await storage.hasUserAccessToEvent(userId, existingItem[0].eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Você não tem acesso a este item' });
    }

    const validatedData = insertScheduleItemSchema.partial().parse(req.body);

    const updatedItem = await db
      .update(scheduleItems)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(scheduleItems.id, id))
      .returning();

    res.json(updatedItem[0]);
  } catch (error) {
    console.error('Erro ao atualizar item do cronograma:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos para o item do cronograma',
        errors: error.errors
      });
    }
    res.status(500).json({ message: 'Erro ao atualizar item do cronograma' });
  }
});

// Excluir um item do cronograma
router.delete('/schedule/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de item inválido' });
    }

    // Verificar existência e acesso
    const existingItem = await db.select().from(scheduleItems).where(eq(scheduleItems.id, id));
    if (existingItem.length === 0) {
      return res.status(404).json({ message: 'Item do cronograma não encontrado' });
    }

    const hasAccess = await storage.hasUserAccessToEvent(userId, existingItem[0].eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Você não tem acesso a este item' });
    }

    await db
      .delete(scheduleItems)
      .where(eq(scheduleItems.id, id));

    res.json({ success: true, message: 'Item do cronograma excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item do cronograma:', error);
    res.status(500).json({ message: 'Erro ao excluir item do cronograma' });
  }
});

export default router;