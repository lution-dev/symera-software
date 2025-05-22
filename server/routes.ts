import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { devModeAuth, ensureDevAuth } from "./devMode";
import { 
  CreateEventData, 
  CreateTaskData, 
  createEventSchema, 
  createTaskSchema,
  insertBudgetItemSchema,
  insertExpenseSchema
} from "@shared/schema";
import { z } from "zod";
import { generateEventChecklist } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Ativar autenticação de desenvolvimento para ambiente de preview
  app.use(devModeAuth);
  
  // Login alternativo temporário para contornar problemas do Replit Auth
  app.post('/api/auth/dev-login', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }
      
      // Criar ou buscar usuário pelo e-mail
      const user = await storage.findOrCreateUserByEmail(email);
      
      // Armazenar na sessão
      req.session.devUserId = user.id;
      req.session.devIsAuthenticated = true;
      await new Promise<void>((resolve) => {
        req.session.save(() => resolve());
      });
      
      console.log(`Login de desenvolvimento bem-sucedido para: ${email} (ID: ${user.id})`);
      
      return res.status(200).json({ 
        success: true,
        user
      });
    } catch (error) {
      console.error("Erro no login de desenvolvimento:", error);
      return res.status(500).json({ message: "Erro no processo de login" });
    }
  });

  // Auth routes - Versão melhorada com suporte a persistência de sessão
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log("Verificando autenticação do usuário:");
      console.log("- Session ID:", req.sessionID);
      console.log("- Is Authenticated:", req.isAuthenticated());
      
      // Limpar qualquer autenticação de desenvolvimento
      req.session.devIsAuthenticated = false;
      req.session.devUserId = undefined;
      
      // Verificar se o usuário está autenticado via Replit Auth
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        console.log("- Usuário autenticado via Replit Auth");
        const userId = req.user.claims.sub;
        console.log("- ID do usuário:", userId);
        const user = await storage.getUser(userId);
        
        if (user) {
          console.log("- Usuário encontrado no banco de dados");
          return res.json(user);
        } else {
          console.log("- Usuário não encontrado no banco de dados");
        }
      }
      
      // Se chegou aqui, não está autenticado
      console.log("- Usuário não autenticado");
      return res.status(401).json({ message: "Unauthorized - Login Required" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error" });
    }
  });

  // Events routes
  app.get('/api/events', ensureDevAuth, async (req: any, res) => {
    try {
      // Obter ID do usuário da sessão de desenvolvimento ou da autenticação Replit
      let userId;
      
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        // Usar ID da sessão de desenvolvimento
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para buscar eventos:", userId);
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Usar ID da autenticação Replit
        userId = req.user.claims.sub;
        console.log("Usando ID de autenticação Replit para buscar eventos:", userId);
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const events = await storage.getEventsByUser(userId);
      
      // Para cada evento, buscar os fornecedores e adicionar a contagem
      for (const event of events) {
        const eventVendors = await storage.getVendorsByEventId(event.id);
        // Adicionar contagem de fornecedores ao evento
        (event as any).vendorCount = eventVendors.length;
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', ensureDevAuth, async (req: any, res) => {
    try {
      // Obter ID do usuário da sessão de desenvolvimento ou da autenticação Replit
      let userId;
      
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        // Usar ID da sessão de desenvolvimento
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar evento:", req.params.id);
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Usar ID da autenticação Replit
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autenticação do usuário ao acessar evento:", req.params.id);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      
      const eventId = parseInt(req.params.id, 10);
      
      if (isNaN(eventId)) {
        console.log("ID de evento inválido:", req.params.id);
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      console.log(`Buscando evento ${eventId} para usuário ${userId}`);
      const event = await storage.getEventById(eventId);
      
      if (!event) {
        console.log(`Evento ${eventId} não encontrado`);
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Verificar se o usuário é o proprietário
      const isOwner = event.ownerId === userId;
      console.log(`O usuário é o proprietário do evento? ${isOwner}`);
      
      // Verificar se o usuário é membro da equipe
      const isTeamMember = await storage.isUserTeamMember(userId, eventId);
      console.log(`O usuário é membro da equipe do evento? ${isTeamMember}`);
      
      if (!isOwner && !isTeamMember) {
        console.log(`Usuário ${userId} não tem acesso ao evento ${eventId}`);
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      // Verificação automática de status baseado nas tarefas e datas
      // Verificamos os logs de atividade para determinar se o status atual foi definido manualmente
      const activities = await storage.getActivityLogsByEventId(eventId);
      
      // Encontramos o último log de atividade relacionado ao status
      const lastStatusActivity = activities
        .filter(log => log.action === "status_updated" || log.action === "status_auto_updated")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
      // Se o último status foi definido manualmente, não devemos alterar automaticamente
      const statusWasSetManually = lastStatusActivity && lastStatusActivity.action === "status_updated";
      
      // Só alteramos automaticamente o status se ele NÃO foi definido manualmente por último
      if (!statusWasSetManually && event.status !== "cancelled") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        // Buscar todas as tarefas do evento
        const tasks = await storage.getTasksByEventId(eventId);
        
        // Só aplicamos automação se o status NÃO foi definido manualmente
        if (!statusWasSetManually) {
          // Verificar se o evento está acontecendo hoje: status = em andamento
          if (eventDate.getTime() === today.getTime() && event.status !== "in_progress" && event.status !== "completed") {
            await storage.updateEvent(eventId, { status: "in_progress" });
            await storage.createActivityLog({
              eventId,
              userId,
              action: "status_auto_updated",
              details: { 
                oldStatus: event.status,
                newStatus: "in_progress",
                reason: "O evento está acontecendo hoje"
              }
            });
            event.status = "in_progress";
          }
          
          // Verificar se o evento já passou e todas as tarefas estão concluídas: status = concluído
          const eventPassed = eventDate < today;
          const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.status === "completed");
          
          if (eventPassed && allTasksCompleted && event.status !== "completed") {
            await storage.updateEvent(eventId, { status: "completed" });
            await storage.createActivityLog({
              eventId,
              userId,
              action: "status_auto_updated",
              details: { 
                oldStatus: event.status,
                newStatus: "completed",
                reason: "O evento já passou e todas as tarefas foram concluídas"
              }
            });
            event.status = "completed";
          }
        }
        
        // Verificar se faltam 3 dias ou menos para o evento e mais de 80% das tarefas estão pendentes
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        
        const isApproaching = eventDate <= threeDaysFromNow && eventDate >= today;
        const pendingTasks = tasks.filter(task => task.status !== "completed");
        const pendingPercentage = tasks.length > 0 ? (pendingTasks.length / tasks.length) * 100 : 0;
        
        // Adicionar alerta ao evento se necessário
        if (isApproaching && pendingPercentage > 80) {
          event.warningMessage = "⚠️ Atenção! A maioria das tarefas ainda não foi concluída e o evento está próximo.";
        } else {
          event.warningMessage = undefined;
        }
      }
      
      console.log(`Retornando dados do evento ${eventId} para usuário ${userId}`);
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate event data
      const eventData = createEventSchema.parse(req.body);
      
      // Preparar os dados para criação do evento com tipos corretos
      const createData: any = {
        ...eventData,
        date: new Date(eventData.date),
        ownerId: userId,
      };
      
      // Adicionar startDate se disponível
      if (eventData.startDate) {
        createData.startDate = new Date(eventData.startDate);
      } else {
        createData.startDate = new Date(eventData.date);
      }
      
      // Adicionar endDate se disponível
      if (eventData.endDate) {
        createData.endDate = new Date(eventData.endDate);
      }
      
      // Create event
      const event = await storage.createEvent(createData);
      
      // Adicionar o criador como membro da equipe (organizador)
      await storage.addTeamMember({
        eventId: event.id,
        userId: userId,
        role: "organizer",
        permissions: { canDelete: true, canEdit: true, canInvite: true }
      });
      
      // Generate AI checklist if requested
      if (eventData.generateAIChecklist) {
        try {
          const checklistItems = await generateEventChecklist(eventData);
          
          // Create tasks from checklist
          for (const item of checklistItems) {
            await storage.createTask({
              title: item.title,
              description: item.description,
              dueDate: item.dueDate,
              priority: item.priority as any || 'medium',
              eventId: event.id,
              assigneeId: userId,
            });
          }
        } catch (error) {
          console.error("Error generating AI checklist:", error);
          // Continue even if checklist generation fails
        }
      }
      
      // Log activity
      await storage.createActivityLog({
        eventId: event.id,
        userId,
        action: "created_event",
        details: { eventName: event.name }
      });
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Validate event data
      const eventData = createEventSchema.parse(req.body);
      
      // Check if user is the owner
      const event = await storage.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.ownerId !== userId) {
        return res.status(403).json({ message: "Only the event owner can update it" });
      }
      
      // Preparar os dados para atualização com tipos corretos
      const updateData: any = {
        ...eventData,
        date: new Date(eventData.date),
      };
      
      // Adicionar startDate se disponível
      if (eventData.startDate) {
        updateData.startDate = new Date(eventData.startDate);
      } else {
        updateData.startDate = new Date(eventData.date);
      }
      
      // Adicionar endDate se disponível
      if (eventData.endDate) {
        updateData.endDate = new Date(eventData.endDate);
      }
      
      // Update event
      const updatedEvent = await storage.updateEvent(eventId, updateData);
      
      // Log activity
      await storage.createActivityLog({
        eventId,
        userId,
        action: "updated_event",
        details: { eventName: updatedEvent.name }
      });
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  // Rota para atualizar apenas o status do evento (PATCH)
  app.patch('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user can access this event
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      // Get current event
      const event = await storage.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Verificar se há um status no body da requisição
      if (!req.body.status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Verificar se o status é válido
      const validStatuses = ["planning", "confirmed", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ 
          message: "Invalid status", 
          validValues: validStatuses 
        });
      }
      
      // Update event with new status
      const updatedEvent = await storage.updateEvent(eventId, { 
        status: req.body.status 
      });
      
      // Log activity
      await storage.createActivityLog({
        eventId,
        userId,
        action: "status_updated",
        details: { 
          eventName: event.name,
          oldStatus: event.status,
          newStatus: req.body.status
        }
      });
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event status:", error);
      res.status(500).json({ message: "Failed to update event status" });
    }
  });

  app.delete('/api/events/:id', ensureDevAuth, async (req: any, res) => {
    try {
      // Obter ID do usuário da sessão de desenvolvimento ou da autenticação Replit
      let userId;
      
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        // Usar ID da sessão de desenvolvimento
        userId = req.session.devUserId;
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Usar ID da autenticação Replit
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const eventId = parseInt(req.params.id, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user is the owner
      const event = await storage.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.ownerId !== userId) {
        return res.status(403).json({ message: "Only the event owner can delete it" });
      }
      
      // Delete event
      await storage.deleteEvent(eventId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Task routes
  // Endpoint para buscar os responsáveis de uma tarefa
  app.get('/api/tasks/:taskId/assignees', ensureDevAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.taskId, 10);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "ID de tarefa inválido" });
      }
      
      // Buscar a tarefa para verificar acesso
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Tarefa não encontrada" });
      }
      
      // Verificar se o usuário tem acesso ao evento da tarefa
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Você não tem acesso a esta tarefa" });
      }
      
      // Buscar os responsáveis da tarefa
      const assignees = await storage.getTaskAssignees(taskId);
      
      res.json(assignees);
    } catch (error) {
      console.error("Erro ao buscar responsáveis da tarefa:", error);
      res.status(500).json({ message: "Falha ao buscar responsáveis da tarefa" });
    }
  });
  
  // Endpoint para buscar uma tarefa específica pelo ID
  app.get('/api/tasks/:id', ensureDevAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id, 10);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "ID de tarefa inválido" });
      }
      
      // Buscar a tarefa
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Tarefa não encontrada" });
      }
      
      // Verificar se o usuário tem acesso ao evento da tarefa
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Você não tem acesso a esta tarefa" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Erro ao buscar tarefa:", error);
      res.status(500).json({ message: "Falha ao buscar tarefa" });
    }
  });
  
  // Endpoint para atualizar uma tarefa específica
  app.put('/api/tasks/:id', ensureDevAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id, 10);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "ID de tarefa inválido" });
      }
      
      // Buscar a tarefa
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Tarefa não encontrada" });
      }
      
      // Verificar se o usuário tem acesso ao evento da tarefa
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Você não tem acesso a esta tarefa" });
      }
      
      // Extrair os IDs dos responsáveis adicionais, se enviados
      const { assigneeIds, ...taskDataRest } = req.body;
      
      // Atualizar a tarefa
      const taskData = {
        ...taskDataRest,
        // Converter a data se existir
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
      };
      
      // Atualizar a tarefa e seus responsáveis
      const updatedTask = await storage.updateTask(taskId, taskData, assigneeIds);
      
      // Registrar atividade
      await storage.createActivityLog({
        eventId: task.eventId,
        userId,
        action: "updated_task",
        details: { taskTitle: updatedTask.title }
      });
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      res.status(500).json({ message: "Falha ao atualizar tarefa" });
    }
  });
  
  // Endpoint para buscar todas as tarefas do usuário
  app.get('/api/tasks', ensureDevAuth, async (req: any, res) => {
    try {
      console.log('Buscando todas as tarefas do usuário');
      // Obter ID do usuário da sessão de desenvolvimento ou da autenticação Replit
      let userId;
      
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        // Usar ID da sessão de desenvolvimento
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para buscar tarefas:", userId);
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Usar ID da autenticação Replit
        userId = req.user.claims.sub;
        console.log("Usando ID de autenticação Replit para buscar tarefas:", userId);
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Buscar todos os eventos que o usuário tem acesso
      const events = await storage.getEventsByUser(userId);
      
      // Para cada evento, buscar as tarefas
      let allTasks = [];
      for (const event of events) {
        const eventTasks = await storage.getTasksByEventId(event.id);
        // Adicionar o nome do evento a cada tarefa para exibir no calendário
        const tasksWithEventName = eventTasks.map(task => ({
          ...task,
          eventName: event.name
        }));
        allTasks = [...allTasks, ...tasksWithEventName];
      }
      
      // Retornar todas as tarefas em ordem de data de vencimento
      allTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      
      console.log(`Retornando ${allTasks.length} tarefas para o usuário ${userId}`);
      res.json(allTasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      res.status(500).json({ message: "Falha ao buscar tarefas" });
    }
  });
  
  app.get('/api/events/:eventId/tasks', ensureDevAuth, async (req: any, res) => {
    try {
      // Obter ID do usuário da sessão de desenvolvimento ou da autenticação Replit
      let userId;
      
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        // Usar ID da sessão de desenvolvimento
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar tarefas do evento:", req.params.eventId);
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Usar ID da autenticação Replit
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autenticação do usuário ao acessar tarefas do evento:", req.params.eventId);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user has access to this event
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      const tasks = await storage.getTasksByEventId(eventId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  // Rota para buscar fornecedores de um evento
  app.get('/api/events/:eventId/vendors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user has access to this event
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      const vendors = await storage.getVendorsByEventId(eventId);
      console.log(`Retornando ${vendors.length} fornecedores para o evento ${eventId}`);
      console.log("Fornecedores:", JSON.stringify(vendors).substring(0, 200) + "...");
      
      // Garantir que estamos enviando um array de fornecedores e não outro tipo de dado
      if (vendors && Array.isArray(vendors)) {
        res.json(vendors);
      } else {
        console.error("ERRO: Dados de fornecedores inválidos:", vendors);
        res.status(500).json({ message: "Invalid vendor data format" });
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  
  // Rota para adicionar fornecedor a um evento
  app.post('/api/events/:eventId/vendors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user has access to this event
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      // Validate vendor data
      if (!req.body.name || !req.body.service) {
        return res.status(400).json({ message: "Name and service are required" });
      }
      
      // Preparar dados do fornecedor
      const vendorData = {
        ...req.body,
        eventId,
        cost: req.body.cost ? parseFloat(req.body.cost) : null
      };
      
      // Create vendor
      const vendor = await storage.createVendor(vendorData);
      
      // Log activity
      await storage.createActivityLog({
        eventId,
        userId,
        action: "vendor_added",
        details: { vendorName: vendor.name, service: vendor.service }
      });
      
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  // Rota para atualizar um fornecedor
  app.put('/api/vendors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendorId = parseInt(req.params.id, 10);
      
      if (isNaN(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      // Buscar fornecedor para verificar a qual evento pertence
      const vendor = await storage.getVendorById(vendorId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Verificar se o usuário tem acesso ao evento do fornecedor
      const hasAccess = await storage.hasUserAccessToEvent(userId, vendor.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this vendor" });
      }
      
      // Preparar dados do fornecedor
      const vendorData = {
        ...req.body,
        cost: req.body.cost ? parseFloat(req.body.cost) : null
      };
      
      // Atualizar fornecedor
      const updatedVendor = await storage.updateVendor(vendorId, vendorData);
      
      // Log activity
      await storage.createActivityLog({
        eventId: vendor.eventId,
        userId,
        action: "vendor_updated",
        details: { vendorName: updatedVendor.name, service: updatedVendor.service }
      });
      
      res.json(updatedVendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  
  // Rota para excluir um fornecedor
  app.delete('/api/vendors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendorId = parseInt(req.params.id, 10);
      
      if (isNaN(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      // Buscar fornecedor para verificar a qual evento pertence
      const vendor = await storage.getVendorById(vendorId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Verificar se o usuário tem acesso ao evento do fornecedor
      const hasAccess = await storage.hasUserAccessToEvent(userId, vendor.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this vendor" });
      }
      
      // Excluir fornecedor
      await storage.deleteVendor(vendorId);
      
      // Log activity
      await storage.createActivityLog({
        eventId: vendor.eventId,
        userId,
        action: "vendor_deleted",
        details: { vendorName: vendor.name, service: vendor.service }
      });
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // Rota para buscar itens de orçamento de um evento
  app.get('/api/events/:eventId/budget', isAuthenticated, async (req: any, res) => {
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
      
      const budgetItems = await storage.getBudgetItemsByEventId(eventId);
      console.log(`Retornando ${budgetItems.length} itens de orçamento para o evento ${eventId}`);
      
      res.json(budgetItems);
    } catch (error) {
      console.error("Erro ao buscar itens de orçamento:", error);
      res.status(500).json({ message: "Falha ao buscar itens de orçamento" });
    }
  });
  
  // Rota para adicionar item ao orçamento
  app.post('/api/events/:eventId/budget', isAuthenticated, async (req: any, res) => {
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
      
      // Validar dados do item de orçamento
      const budgetItemSchema = insertBudgetItemSchema.omit({ id: true, createdAt: true, updatedAt: true });
      const validatedData = budgetItemSchema.parse({
        ...req.body,
        eventId: eventId,
        amount: parseFloat(req.body.amount),
        paid: req.body.paid || false
      });
      
      // Criar item de orçamento
      const budgetItem = await storage.createBudgetItem(validatedData);
      
      // Log da atividade
      await storage.createActivityLog({
        eventId,
        userId,
        action: "budget_item_added",
        details: { 
          itemName: budgetItem.name, 
          category: budgetItem.category,
          amount: budgetItem.amount
        }
      });
      
      res.status(201).json(budgetItem);
    } catch (error) {
      console.error("Erro ao adicionar item ao orçamento:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos para o item de orçamento", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Falha ao adicionar item ao orçamento" });
    }
  });
  
  // Rota para atualizar item do orçamento
  app.put('/api/budget/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID de item inválido" });
      }
      
      // Buscar item para verificar a qual evento pertence
      const budgetItem = await storage.getBudgetItemById(itemId);
      
      if (!budgetItem) {
        return res.status(404).json({ message: "Item de orçamento não encontrado" });
      }
      
      // Verificar se o usuário tem acesso ao evento do item
      const hasAccess = await storage.hasUserAccessToEvent(userId, budgetItem.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Você não tem acesso a este item" });
      }
      
      // Validar dados do item
      const updateSchema = insertBudgetItemSchema.partial().omit({ id: true, eventId: true, createdAt: true, updatedAt: true });
      
      const updateData = updateSchema.parse({
        ...req.body,
        amount: req.body.amount ? parseFloat(req.body.amount) : undefined
      });
      
      // Atualizar item
      const updatedItem = await storage.updateBudgetItem(itemId, updateData);
      
      // Log da atividade
      await storage.createActivityLog({
        eventId: budgetItem.eventId,
        userId,
        action: "budget_item_updated",
        details: { 
          itemName: updatedItem.name, 
          category: updatedItem.category,
          amount: updatedItem.amount
        }
      });
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Erro ao atualizar item do orçamento:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos para o item de orçamento", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Falha ao atualizar item do orçamento" });
    }
  });
  
  // Rota para excluir item do orçamento
  app.delete('/api/budget/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID de item inválido" });
      }
      
      // Buscar item para verificar a qual evento pertence
      const budgetItem = await storage.getBudgetItemById(itemId);
      
      if (!budgetItem) {
        return res.status(404).json({ message: "Item de orçamento não encontrado" });
      }
      
      // Verificar se o usuário tem acesso ao evento do item
      const hasAccess = await storage.hasUserAccessToEvent(userId, budgetItem.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Você não tem acesso a este item" });
      }
      
      // Excluir item
      await storage.deleteBudgetItem(itemId);
      
      // Log da atividade
      await storage.createActivityLog({
        eventId: budgetItem.eventId,
        userId,
        action: "budget_item_deleted",
        details: { 
          itemName: budgetItem.name, 
          category: budgetItem.category,
          amount: budgetItem.amount
        }
      });
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro ao excluir item do orçamento:", error);
      res.status(500).json({ message: "Falha ao excluir item do orçamento" });
    }
  });

  app.post('/api/events/:eventId/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user has access to this event
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      // Validate task data
      const taskData: CreateTaskData = {
        ...req.body,
        eventId
      };
      
      const validatedTaskData = createTaskSchema.parse(taskData);
      
      // Preparar dados da tarefa com tipos corretos
      const taskDataToCreate: any = {
        ...validatedTaskData,
      };
      
      // Converter dueDate para objeto Date se existir
      if (validatedTaskData.dueDate) {
        taskDataToCreate.dueDate = new Date(validatedTaskData.dueDate);
      }
      
      // Create task
      const task = await storage.createTask(taskDataToCreate);
      
      // Log activity
      await storage.createActivityLog({
        eventId,
        userId,
        action: "created_task",
        details: { taskTitle: task.title }
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id, 10);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Get task
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user has access to the event
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      
      // Update task
      const updatedTask = await storage.updateTask(taskId, req.body);
      
      // Log activity
      await storage.createActivityLog({
        eventId: task.eventId,
        userId,
        action: "updated_task",
        details: { 
          taskTitle: updatedTask.title,
          changes: req.body.status ? { status: req.body.status } : {}
        }
      });
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id, 10);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Get task
      const task = await storage.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if user has access to the event
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      
      // Delete task
      await storage.deleteTask(taskId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Team members routes
  app.get('/api/events/:eventId/team', ensureDevAuth, async (req: any, res) => {
    try {
      // Obter ID do usuário da sessão de desenvolvimento ou da autenticação Replit
      let userId;
      
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        // Usar ID da sessão de desenvolvimento
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar equipe do evento:", req.params.eventId);
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Usar ID da autenticação Replit
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autenticação do usuário ao acessar equipe do evento:", req.params.eventId);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user has access to this event
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      const teamMembers = await storage.getTeamMembersByEventId(eventId);
      console.log(`Membros da equipe para o evento ${eventId}:`, teamMembers.length);
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post('/api/events/:eventId/team', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user is the owner
      const event = await storage.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.ownerId !== userId) {
        return res.status(403).json({ message: "Only the event owner can add team members" });
      }
      
      // Validate team member data
      if (!req.body.email || !req.body.role) {
        return res.status(400).json({ message: "Email and role are required" });
      }
      
      // Find or create user by email
      const member = await storage.findOrCreateUserByEmail(req.body.email);
      
      // Add team member
      const teamMember = await storage.addTeamMember({
        eventId,
        userId: member.id,
        role: req.body.role,
        permissions: req.body.permissions || {}
      });
      
      // Log activity
      await storage.createActivityLog({
        eventId,
        userId,
        action: "added_team_member",
        details: { memberEmail: req.body.email, role: req.body.role }
      });
      
      res.status(201).json(teamMember);
    } catch (error) {
      console.error("Error adding team member:", error);
      res.status(500).json({ message: "Failed to add team member" });
    }
  });

  // User profile update route
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate user data
      if (!req.body) {
        return res.status(400).json({ message: "Profile data is required" });
      }
      
      // Get current user data
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.upsertUser({
        ...currentUser,
        firstName: req.body.firstName !== undefined ? req.body.firstName : currentUser.firstName,
        lastName: req.body.lastName !== undefined ? req.body.lastName : currentUser.lastName,
        phone: req.body.phone !== undefined ? req.body.phone : currentUser.phone,
        profileImageUrl: req.body.profileImageUrl !== undefined ? req.body.profileImageUrl : currentUser.profileImageUrl,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // Notifications update route
  app.put('/api/user/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In a real application, you would update user notification preferences in the database
      // For now, we'll just return success
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Dashboard data route
  app.get('/api/dashboard', ensureDevAuth, async (req: any, res) => {
    try {
      // Obter ID do usuário da sessão de desenvolvimento ou da autenticação Replit
      let userId;
      
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        // Usar ID da sessão de desenvolvimento
        userId = req.session.devUserId;
        console.log(`Buscando dados do dashboard para o usuário de desenvolvimento: ${userId}`);
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Usar ID da autenticação Replit
        userId = req.user.claims.sub;
        console.log(`Buscando dados do dashboard para o usuário autenticado: ${userId}`);
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get all events for the user
      const events = await storage.getEventsByUser(userId);
      console.log(`Total de eventos encontrados: ${events.length}`);
      
      // Get active events (planning, confirmed, in_progress or active status)
      const activeEvents = events.filter(event => 
        event.status === "planning" || 
        event.status === "confirmed" || 
        event.status === "in_progress" || 
        event.status === "active"
      );
      console.log(`Eventos ativos encontrados: ${activeEvents.length}`);
      
      // Carregar informações detalhadas para eventos ativos (equipe e tarefas)
      const activeEventsWithDetails = await Promise.all(
        activeEvents.map(async (event) => {
          const tasks = await storage.getTasksByEventId(event.id);
          const team = await storage.getTeamMembersByEventId(event.id);
          console.log(`Evento ${event.id} - ${event.name}: ${tasks.length} tarefas, ${team.length} membros na equipe`);
          return {
            ...event,
            team,
            tasks
          };
        })
      );
      
      // Get upcoming events (next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= thirtyDaysFromNow;
      });
      
      // Get pending tasks
      let pendingTasks = [];
      for (const event of events) {
        const tasks = await storage.getTasksByEventId(event.id);
        pendingTasks = pendingTasks.concat(
          tasks.filter(task => task.status !== "completed")
        );
      }
      
      // Get recent activities
      let recentActivities = [];
      for (const event of events) {
        const activities = await storage.getActivityLogsByEventId(event.id);
        recentActivities = recentActivities.concat(activities);
      }
      
      // Sort by date and limit to 10
      recentActivities.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      recentActivities = recentActivities.slice(0, 10);
      
      res.json({
        totalEvents: events.length,
        activeEvents: activeEvents.length,
        activeEventsList: activeEventsWithDetails,  // Nova propriedade com eventos ativos
        upcomingEvents,
        pendingTasks,
        recentActivities
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Activity log routes
  app.get('/api/events/:eventId/activities', ensureDevAuth, async (req: any, res) => {
    try {
      // Obter ID do usuário da sessão de desenvolvimento ou da autenticação Replit
      let userId;
      
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        // Usar ID da sessão de desenvolvimento
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar atividades do evento:", req.params.eventId);
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Usar ID da autenticação Replit
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autenticação do usuário ao acessar atividades do evento:", req.params.eventId);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user has access to this event
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      const activities = await storage.getActivityLogsByEventId(eventId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Generate AI checklist for existing event
  app.post('/api/events/:eventId/generate-checklist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Check if user has access to this event
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      
      // Get event
      const event = await storage.getEventById(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Generate AI checklist
      const checklistItems = await generateEventChecklist({
        name: event.name,
        type: event.type,
        date: event.date,
        location: event.location || undefined,
        description: event.description || undefined,
        budget: event.budget || undefined,
        attendees: event.attendees || undefined,
        generateAIChecklist: true
      });
      
      // Create tasks from checklist
      const tasks = [];
      for (const item of checklistItems) {
        // Criar tarefa com o proprietário como único responsável
        const task = await storage.createTask({
          title: item.title,
          description: item.description,
          dueDate: item.dueDate,
          priority: item.priority as any || 'medium',
          eventId: event.id,
          assigneeId: userId,
        }, [userId]); // Adicionamos o userId como o único responsável na tabela de assignees
        tasks.push(task);
      }
      
      // Log activity
      await storage.createActivityLog({
        eventId,
        userId,
        action: "generated_ai_checklist",
        details: { taskCount: tasks.length }
      });
      
      res.status(201).json(tasks);
    } catch (error) {
      console.error("Error generating AI checklist:", error);
      res.status(500).json({ message: "Failed to generate AI checklist" });
    }
  });

  // ==== Rotas para Despesas ====
  
  // Obter despesas de um evento
  app.get('/api/events/:eventId/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inválido" });
      }
      
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permissão para acessar este evento" });
      }
      
      const expenses = await storage.getExpensesByEventId(eventId);
      console.log(`Retornando ${expenses.length} despesas para o evento ${eventId}`);
      
      res.json(expenses);
    } catch (error) {
      console.error("Erro ao obter despesas:", error);
      res.status(500).json({ message: "Erro ao processar solicitação" });
    }
  });
  
  // Adicionar nova despesa
  app.post('/api/events/:eventId/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inválido" });
      }
      
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permissão para acessar este evento" });
      }
      
      const expenseSchema = insertExpenseSchema.omit({ id: true, createdAt: true, updatedAt: true });
      const validatedData = expenseSchema.parse({
        ...req.body,
        eventId,
      });
      
      const expense = await storage.createExpense(validatedData);
      
      // Registrar atividade
      await storage.createActivityLog({
        eventId,
        userId,
        action: "expense_added",
        details: {
          itemName: expense.name, 
          category: expense.category,
          amount: expense.amount,
          vendorId: expense.vendorId
        }
      });
      
      res.status(201).json(expense);
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      res.status(500).json({ message: "Erro ao processar solicitação" });
    }
  });
  
  // Atualizar despesa
  app.put('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const expense = await storage.getExpenseById(itemId);
      
      if (!expense) {
        return res.status(404).json({ message: "Despesa não encontrada" });
      }
      
      const hasAccess = await storage.hasUserAccessToEvent(userId, expense.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permissão para executar esta ação" });
      }
      
      // Validação - só atualizamos os campos fornecidos
      const validatedUpdates = insertExpenseSchema.partial().parse(req.body);
      
      const updatedExpense = await storage.updateExpense(itemId, validatedUpdates);
      
      // Registrar atividade
      await storage.createActivityLog({
        eventId: expense.eventId,
        userId,
        action: "expense_updated",
        details: {
          itemName: updatedExpense.name,
          amount: updatedExpense.amount,
          paid: updatedExpense.paid
        }
      });
      
      res.json(updatedExpense);
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
      res.status(500).json({ message: "Erro ao processar solicitação" });
    }
  });
  
  // Excluir despesa
  app.delete('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const expense = await storage.getExpenseById(itemId);
      
      if (!expense) {
        return res.status(404).json({ message: "Despesa não encontrada" });
      }
      
      const hasAccess = await storage.hasUserAccessToEvent(userId, expense.eventId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permissão para executar esta ação" });
      }
      
      await storage.deleteExpense(itemId);
      
      // Registrar atividade
      await storage.createActivityLog({
        eventId: expense.eventId,
        userId,
        action: "expense_deleted",
        details: {
          itemName: expense.name, 
          category: expense.category,
          amount: expense.amount
        }
      });
      
      res.status(200).json({ message: "Despesa excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      res.status(500).json({ message: "Erro ao processar solicitação" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
