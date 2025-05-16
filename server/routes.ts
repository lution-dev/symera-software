import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { CreateEventData, CreateTaskData, createEventSchema, createTaskSchema } from "@shared/schema";
import { z } from "zod";
import { generateEventChecklist } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
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

  // Auth routes - Modificada para verificar login alternativo primeiro
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Verificar login alternativo primeiro
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        const user = await storage.getUser(req.session.devUserId);
        if (user) {
          return res.json(user);
        }
      }
      
      // Cair para autenticação normal se login alternativo não funcionar
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      // Se não conseguiu autenticar de nenhuma forma
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Events routes
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getEventsByUser(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user || !req.user.claims || !req.user.claims.sub) {
        console.log("Erro na autenticação do usuário ao acessar evento:", req.params.id);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      
      const userId = req.user.claims.sub;
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

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  // Endpoint para buscar todas as tarefas do usuário
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      console.log('Buscando todas as tarefas do usuário');
      const userId = req.user.claims.sub;
      
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
  
  app.get('/api/events/:eventId/tasks', isAuthenticated, async (req: any, res) => {
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
      
      const tasks = await storage.getTasksByEventId(eventId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
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
  app.get('/api/events/:eventId/team', isAuthenticated, async (req: any, res) => {
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
      
      const teamMembers = await storage.getTeamMembersByEventId(eventId);
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
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log(`Buscando dados do dashboard para o usuário: ${userId}`);
      
      // Get all events for the user
      const events = await storage.getEventsByUser(userId);
      console.log(`Total de eventos encontrados: ${events.length}`);
      
      // Get active events
      const activeEvents = events.filter(event => event.status === "active");
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
  app.get('/api/events/:eventId/activities', isAuthenticated, async (req: any, res) => {
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
        const task = await storage.createTask({
          title: item.title,
          description: item.description,
          dueDate: item.dueDate,
          priority: item.priority as any || 'medium',
          eventId: event.id,
          assigneeId: userId,
        });
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

  const httpServer = createServer(app);
  return httpServer;
}
