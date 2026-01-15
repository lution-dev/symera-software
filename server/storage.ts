import {
  users,
  events,
  tasks,
  taskAssignees,
  eventTeamMembers,
  vendors,
  activityLogs,
  budgetItems,
  expenses,
  scheduleItems,
  documents,
  participants,
  eventFeedbacks,
  feedbackMetrics,
  type User,
  type Event,
  type Task,
  type TeamMember,
  type EventTeamMember,
  type Vendor,
  type ActivityLog,
  type BudgetItem,
  type Expense,
  type Document,
  type Participant,
  type EventFeedback,
  type FeedbackMetrics,
  type UpsertUser,
  type InsertEvent,
  type InsertTask,
  type InsertTaskAssignee,
  type TaskAssignee,
  type InsertEventTeamMember,
  type InsertVendor,
  type InsertActivityLog,
  type InsertBudgetItem,
  type InsertExpense,
  type InsertDocument,
  type InsertParticipant,
  type InsertEventFeedback,
  type InsertFeedbackMetrics,
} from "@shared/schema";
import { db, executeWithRetry } from "./db";
import { eq, and, or, desc, gte, lte, sql, isNotNull } from "drizzle-orm";

// Sistema de cache em memória para reduzir consultas
class MemoryCache {
  private cache: Map<string, { data: any, timestamp: number }>;
  private ttl: number; // Tempo de vida do cache em ms

  constructor(ttlMs: number = 60000) { // Default: 1 minuto
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Verificar se o cache está expirado
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidate(prefix: string): void {
    Array.from(this.cache.keys()).forEach(key => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    });
  }
}

// Criar instâncias de cache para diferentes tipos de dados
const userCache = new MemoryCache(300000); // 5 minutos
const eventCache = new MemoryCache(180000); // 3 minutos
const taskCache = new MemoryCache(120000); // 2 minutos
const documentCache = new MemoryCache(120000); // 2 minutos
const participantCache = new MemoryCache(120000); // 2 minutos

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  findOrCreateUserByEmail(email: string): Promise<User>;
  
  // Event operations
  getEventsByUser(userId: string): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  
  // Task operations
  getTasksByEventId(eventId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask, assigneeIds?: string[]): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>, assigneeIds?: string[]): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Task assignee operations
  getTaskAssignees(taskId: number): Promise<(TaskAssignee & { user: User })[]>;
  addTaskAssignee(taskId: number, userId: string): Promise<TaskAssignee>;
  removeTaskAssignee(taskId: number, userId: string): Promise<void>;
  replaceTaskAssignees(taskId: number, userIds: string[]): Promise<TaskAssignee[]>;
  
  // Task reminder operations
  getTaskReminders(taskId: number): Promise<TaskReminder[]>;
  getTaskRemindersByUser(userId: string): Promise<TaskReminder[]>;
  createTaskReminder(reminder: InsertTaskReminder): Promise<TaskReminder>;
  markReminderAsSent(id: number): Promise<TaskReminder>;
  deleteTaskReminder(id: number): Promise<void>;
  
  // Team member operations
  getTeamMembersByEventId(eventId: number): Promise<(EventTeamMember & { user: User })[]>;
  addTeamMember(teamMember: InsertEventTeamMember): Promise<EventTeamMember>;
  removeTeamMember(eventId: number, userId: string): Promise<void>;
  isUserTeamMember(userId: string, eventId: number): Promise<boolean>;
  hasUserAccessToEvent(userId: string, eventId: number): Promise<boolean>;
  
  // Vendor operations
  getVendorsByEventId(eventId: number): Promise<Vendor[]>;
  getVendorById(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: number): Promise<void>;
  
  // Budget item operations
  getBudgetItemsByEventId(eventId: number): Promise<BudgetItem[]>;
  getBudgetItemById(id: number): Promise<BudgetItem | undefined>;
  createBudgetItem(budgetItem: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, budgetItem: Partial<InsertBudgetItem>): Promise<BudgetItem>;
  deleteBudgetItem(id: number): Promise<void>;
  
  // Expense operations
  getExpensesByEventId(eventId: number): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  
  // Activity log operations
  getActivityLogsByEventId(eventId: number): Promise<ActivityLog[]>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  
  // Document operations
  getDocumentsByEventId(eventId: number): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  getDocumentsByCategory(eventId: number, category: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Participant operations
  getParticipantsByEventId(eventId: number): Promise<Participant[]>;
  getParticipantById(id: number): Promise<Participant | undefined>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  createParticipants(participants: InsertParticipant[]): Promise<Participant[]>;
  updateParticipant(id: number, participant: Partial<InsertParticipant>): Promise<Participant>;
  deleteParticipant(id: number): Promise<void>;
  getParticipantStats(eventId: number): Promise<{ total: number; confirmed: number; pending: number }>;
  
  // Feedback operations
  getFeedbacksByEventId(eventId: number): Promise<EventFeedback[]>;
  getFeedbackByFeedbackId(feedbackId: string): Promise<(EventFeedback & { event: Event }) | undefined>;
  createFeedback(feedback: InsertEventFeedback): Promise<EventFeedback>;
  deleteFeedback(id: number): Promise<void>;
  generateFeedbackLink(eventId: number): Promise<string>;
  getEventByFeedbackId(feedbackId: string): Promise<Event | undefined>;
  getEventFeedbackByFeedbackId(feedbackId: string): Promise<{ eventId: number; feedbackId: string } | undefined>;
  getFeedbackStats(eventId: number): Promise<{ total: number; averageRating: number; anonymousPercentage: number }>;
  
  // Feedback metrics operations
  createFeedbackMetric(metric: InsertFeedbackMetrics): Promise<FeedbackMetrics>;
  updateFeedbackMetricSubmission(feedbackId: string, ipAddress?: string, userAgent?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    // Verificar cache primeiro
    const cacheKey = `user:${id}`;
    const cachedUser = userCache.get<User>(cacheKey);
    if (cachedUser) return cachedUser;
    
    // Se não estiver em cache, consultar banco de dados com retry
    return executeWithRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      
      // Armazenar em cache para futuras requisições
      if (user) {
        userCache.set(cacheKey, user);
      }
      
      return user;
    });
  }

  async getAllUsers(): Promise<User[]> {
    const cacheKey = 'all:users';
    const cachedUsers = userCache.get<User[]>(cacheKey);
    if (cachedUsers) return cachedUsers;
    
    return executeWithRetry(async () => {
      const allUsers = await db.select().from(users);
      
      // Armazenar em cache para futuras requisições
      userCache.set(cacheKey, allUsers);
      
      return allUsers;
    });
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    // Verificar cache pelo email
    const cacheKey = `user:email:${email}`;
    const cachedUser = userCache.get<User>(cacheKey);
    if (cachedUser) return cachedUser;
    
    return executeWithRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      // Armazenar em cache para futuras requisições
      if (user) {
        userCache.set(cacheKey, user);
        userCache.set(`user:${user.id}`, user);
      }
      
      return user;
    });
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return executeWithRetry(async () => {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      
      // Invalidar e atualizar cache
      userCache.invalidate(`user:${user.id}`);
      userCache.set(`user:${user.id}`, user);
      
      return user;
    });
  }

  async findOrCreateUserByEmail(email: string, name?: string, phone?: string): Promise<User> {
    // Verificar cache pelo email
    const cacheKey = `user:email:${email}`;
    const cachedUser = userCache.get<User>(cacheKey);
    if (cachedUser) return cachedUser;
    
    return executeWithRetry(async () => {
      // Check if user exists
      const existingUsers = await db.select().from(users).where(eq(users.email, email));
      
      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        // Atualizar cache
        userCache.set(`user:${user.id}`, user);
        userCache.set(cacheKey, user);
        return user;
      }
      
      // Parse name if provided
      const nameParts = name ? name.trim().split(' ') : email.split('@')[0].split('.');
      const firstName = nameParts[0] || email.split('@')[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email,
          firstName,
          lastName: lastName || null,
          phone: phone || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      // Atualizar cache
      userCache.set(`user:${newUser.id}`, newUser);
      userCache.set(cacheKey, newUser);
      
      return newUser;
    });
  }

  async migrateUserFromLocalToReplit(localUserId: string, replitUserId: string): Promise<void> {
    return executeWithRetry(async () => {
      console.log(`Migrando usuário de ${localUserId} para ${replitUserId}`);
      
      // Verificar se já existe um usuário com o novo ID (Supabase)
      const existingNewUser = await db.select().from(users).where(eq(users.id, replitUserId));
      
      if (existingNewUser.length > 0) {
        console.log(`Usuário com ID ${replitUserId} já existe. Apenas migrando referências.`);
        
        // Apenas atualizar as referências para o novo ID
        await Promise.all([
          db.update(eventTeamMembers)
            .set({ userId: replitUserId })
            .where(eq(eventTeamMembers.userId, localUserId)),
          
          db.update(events)
            .set({ ownerId: replitUserId })
            .where(eq(events.ownerId, localUserId)),
          
          db.update(taskAssignees)
            .set({ userId: replitUserId })
            .where(eq(taskAssignees.userId, localUserId)),
          
          db.update(documents)
            .set({ uploadedById: replitUserId })
            .where(eq(documents.uploadedById, localUserId)),
          
          db.update(activityLogs)
            .set({ userId: replitUserId })
            .where(eq(activityLogs.userId, localUserId))
        ]);
        
        // Deletar o usuário local antigo (não é mais necessário)
        try {
          await db.delete(users).where(eq(users.id, localUserId));
          console.log(`Usuário antigo ${localUserId} removido.`);
        } catch (deleteError) {
          console.log(`Não foi possível deletar usuário antigo ${localUserId}:`, deleteError);
        }
      } else {
        // Não existe usuário com o novo ID, atualizar o ID do usuário existente
        console.log(`Atualizando ID do usuário de ${localUserId} para ${replitUserId}`);
        
        // Primeiro atualizar todas as referências
        await Promise.all([
          db.update(eventTeamMembers)
            .set({ userId: replitUserId })
            .where(eq(eventTeamMembers.userId, localUserId)),
          
          db.update(events)
            .set({ ownerId: replitUserId })
            .where(eq(events.ownerId, localUserId)),
          
          db.update(taskAssignees)
            .set({ userId: replitUserId })
            .where(eq(taskAssignees.userId, localUserId)),
          
          db.update(documents)
            .set({ uploadedById: replitUserId })
            .where(eq(documents.uploadedById, localUserId)),
          
          db.update(activityLogs)
            .set({ userId: replitUserId })
            .where(eq(activityLogs.userId, localUserId))
        ]);
        
        // Atualizar o ID do próprio usuário
        await db.update(users)
          .set({ id: replitUserId, updatedAt: new Date() })
          .where(eq(users.id, localUserId));
      }
      
      // Invalidar caches relacionados
      userCache.invalidate(`user:${localUserId}`);
      userCache.invalidate(`user:${replitUserId}`);
      userCache.invalidate(`user:email:`);
      eventCache.invalidate(`events:user:${localUserId}`);
      eventCache.invalidate(`events:user:${replitUserId}`);
      eventCache.invalidate(`events:`);
      
      console.log(`Migração concluída de ${localUserId} para ${replitUserId}`);
    });
  }

  // Event operations
  async getEventsByUser(userId: string): Promise<Event[]> {
    // Verificar cache
    const cacheKey = `events:user:${userId}`;
    const cachedEvents = eventCache.get<Event[]>(cacheKey);
    if (cachedEvents) return cachedEvents;
    
    return executeWithRetry(async () => {
      // Get events where user is owner
      const ownedEvents = await db
        .select()
        .from(events)
        .where(eq(events.ownerId, userId))
        .orderBy(desc(events.startDate));
      
      // Get events where user is team member
      const teamMemberships = await db
        .select({
          eventId: eventTeamMembers.eventId,
        })
        .from(eventTeamMembers)
        .where(eq(eventTeamMembers.userId, userId));
      
      const teamEventIds = teamMemberships.map(tm => tm.eventId);
      
      if (teamEventIds.length === 0) {
        // Adicionar informações da equipe e tarefas para eventos do proprietário
        const eventsWithTeamAndTasks = await Promise.all(
          ownedEvents.map(async (event) => {
            const teamMembers = await this.getTeamMembersByEventId(event.id);
            const tasks = await this.getTasksByEventId(event.id);
            return {
              ...event,
              team: teamMembers,
              tasks: tasks
            };
          })
        );
        // Armazenar em cache
        eventCache.set(cacheKey, eventsWithTeamAndTasks);
        return eventsWithTeamAndTasks;
      }
      
      // Get team events (usando consulta em lote para reduzir requisições)
      let teamEvents: Event[] = [];
      if (teamEventIds.length > 0) {
        if (teamEventIds.length === 1) {
          // Se houver apenas um ID, use eq() 
          teamEvents = await db
            .select()
            .from(events)
            .where(eq(events.id, teamEventIds[0]));
        } else {
          // Buscar eventos em lotes menores para evitar problemas
          // Essa abordagem evita usar o operador OR com muitas condições
          const batchResults = await Promise.all(
            teamEventIds.map(id => 
              db.select().from(events).where(eq(events.id, id))
            )
          );
          
          // Combinar resultados de todos os lotes
          teamEvents = batchResults.flat();
        }
      }
      
      // Combine owned and team events, removing duplicates
      const allEvents = [...ownedEvents];
      for (const event of teamEvents) {
        if (event && !allEvents.some(e => e.id === event.id)) {
          allEvents.push(event);
        }
      }
      
      // Sort by startDate (com fallback para date se necessário)
      const sortedEvents = allEvents.sort((a, b) => {
        const dateA = a.startDate || a.date;
        const dateB = b.startDate || b.date;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      // Adicionar informações da equipe e tarefas para todos os eventos
      const eventsWithTeamAndTasks = await Promise.all(
        sortedEvents.map(async (event) => {
          const teamMembers = await this.getTeamMembersByEventId(event.id);
          const tasks = await this.getTasksByEventId(event.id);
          return {
            ...event,
            team: teamMembers,
            tasks: tasks
          };
        })
      );
      
      // Armazenar em cache
      eventCache.set(cacheKey, eventsWithTeamAndTasks);
      return eventsWithTeamAndTasks;
    });
  }

  async getEventById(id: number): Promise<Event | undefined> {
    // Desativando cache temporariamente para garantir dados atualizados
    return executeWithRetry(async () => {
      const [event] = await db.select().from(events).where(eq(events.id, id));
      console.log(`Evento ${id} recuperado diretamente do banco:`, event);
      return event;
    });
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    return executeWithRetry(async () => {
      const [event] = await db.insert(events).values(eventData).returning();
      
      // Invalidar caches relacionados
      eventCache.invalidate(`events:user:${eventData.ownerId}`);
      eventCache.set(`event:${event.id}`, event);
      
      return event;
    });
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event> {
    return executeWithRetry(async () => {
      console.log('Atualizando evento com dados:', JSON.stringify(eventData, null, 2));
      console.log('Formato do evento recebido:', eventData.format);
      console.log('MeetingUrl recebido:', eventData.meetingUrl);
      
      // Garantir que o formato seja salvo corretamente
      let dataToUpdate = {
        ...eventData,
        updatedAt: new Date(),
      };
      
      // Log detalhado do que será salvo
      console.log('Dados a serem salvos:', JSON.stringify(dataToUpdate, null, 2));
      
      const [event] = await db
        .update(events)
        .set(dataToUpdate)
        .where(eq(events.id, id))
        .returning();
      
      console.log('Evento atualizado no banco:', JSON.stringify(event, null, 2));
      
      // Limpar completamente os caches relacionados a eventos
      eventCache.invalidate(`event:${id}`);
      eventCache.invalidate(`events:user:`); 
      eventCache.invalidate(`events:`);
      
      // Não armazenar em cache imediatamente para forçar 
      // a obtenção de dados frescos da próxima vez
      
      return event;
    });
  }

  async deleteEvent(id: number): Promise<void> {
    return executeWithRetry(async () => {
      // Obter o evento antes de excluir para identificar o proprietário
      const [event] = await db.select().from(events).where(eq(events.id, id));
      
      await db.delete(events).where(eq(events.id, id));
      
      // Invalidar caches
      eventCache.invalidate(`event:${id}`);
      if (event) {
        eventCache.invalidate(`events:user:${event.ownerId}`);
      }
      eventCache.invalidate(`events:user:`); // Invalidar qualquer cache de lista de eventos
    });
  }

  // Task operations
  async getTasksByEventId(eventId: number): Promise<Task[]> {
    // Verificar cache
    const cacheKey = `tasks:event:${eventId}`;
    const cachedTasks = taskCache.get<Task[]>(cacheKey);
    if (cachedTasks) return cachedTasks;
    
    return executeWithRetry(async () => {
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.eventId, eventId))
        .orderBy(tasks.dueDate);
      
      // Armazenar em cache
      taskCache.set(cacheKey, result);
      return result;
    });
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    // Verificar cache
    const cacheKey = `task:${id}`;
    const cachedTask = taskCache.get<Task>(cacheKey);
    if (cachedTask) return cachedTask;
    
    return executeWithRetry(async () => {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      
      // Armazenar em cache
      if (task) {
        taskCache.set(cacheKey, task);
      }
      
      return task;
    });
  }

  async createTask(taskData: InsertTask, assigneeIds?: string[]): Promise<Task> {
    return executeWithRetry(async () => {
      const [task] = await db.insert(tasks).values(taskData).returning();
      
      // Add multiple assignees if provided
      if (assigneeIds && assigneeIds.length > 0) {
        await this.replaceTaskAssignees(task.id, assigneeIds);
      }
      
      // Invalidar e atualizar cache
      taskCache.invalidate(`tasks:event:${taskData.eventId}`);
      taskCache.set(`task:${task.id}`, task);
      
      return task;
    });
  }

  async updateTask(id: number, taskData: Partial<InsertTask>, assigneeIds?: string[]): Promise<Task> {
    return executeWithRetry(async () => {
      const [task] = await db
        .update(tasks)
        .set({
          ...taskData,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, id))
        .returning();
      
      // Update multiple assignees if provided
      if (assigneeIds !== undefined) {
        await this.replaceTaskAssignees(task.id, assigneeIds);
      }
      
      // Invalidar e atualizar caches
      taskCache.set(`task:${id}`, task);
      
      // Se eventId foi atualizado, invalidar caches de ambos os eventos
      if (taskData.eventId) {
        // Obter a tarefa antiga para saber o eventId antigo
        const oldTask = await this.getTaskById(id);
        if (oldTask && oldTask.eventId !== taskData.eventId) {
          taskCache.invalidate(`tasks:event:${oldTask.eventId}`);
        }
        taskCache.invalidate(`tasks:event:${taskData.eventId}`);
      } else {
        // Se não temos eventId nos dados de atualização, obter do resultado
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
      
      return task;
    });
  }

  async deleteTask(id: number): Promise<void> {
    return executeWithRetry(async () => {
      // Obter a tarefa antes de excluir para saber o eventId
      const task = await this.getTaskById(id);
      
      await db.delete(tasks).where(eq(tasks.id, id));
      
      // Invalidar caches
      taskCache.invalidate(`task:${id}`);
      if (task) {
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
    });
  }

  // Team member operations
  async getTeamMembersByEventId(eventId: number): Promise<(EventTeamMember & { user: User })[]> {
    const teamMembers = await db
      .select()
      .from(eventTeamMembers)
      .where(eq(eventTeamMembers.eventId, eventId));
    
    // Get user details for each team member
    return Promise.all(
      teamMembers.map(async (member) => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, member.userId));
        
        return {
          ...member,
          user,
        };
      })
    );
  }

  async addTeamMember(teamMemberData: InsertEventTeamMember): Promise<EventTeamMember> {
    // Check if already a team member
    const existingMembers = await db
      .select()
      .from(eventTeamMembers)
      .where(
        and(
          eq(eventTeamMembers.eventId, teamMemberData.eventId),
          eq(eventTeamMembers.userId, teamMemberData.userId)
        )
      );
    
    if (existingMembers.length > 0) {
      // Update existing team member
      const [teamMember] = await db
        .update(eventTeamMembers)
        .set({
          role: teamMemberData.role,
          permissions: teamMemberData.permissions,
        })
        .where(
          and(
            eq(eventTeamMembers.eventId, teamMemberData.eventId),
            eq(eventTeamMembers.userId, teamMemberData.userId)
          )
        )
        .returning();
      return teamMember;
    }
    
    // Add new team member
    const [teamMember] = await db
      .insert(eventTeamMembers)
      .values(teamMemberData)
      .returning();
    return teamMember;
  }

  async removeTeamMember(eventId: number, userId: string): Promise<void> {
    return executeWithRetry(async () => {
      const result = await db
        .delete(eventTeamMembers)
        .where(
          and(
            eq(eventTeamMembers.eventId, eventId),
            eq(eventTeamMembers.userId, userId)
          )
        );
      
      console.log(`Removendo membro da equipe - EventId: ${eventId}, UserId: ${userId}, Linhas afetadas:`, result);
      
      // Invalidar cache da equipe
      userCache.invalidate(`team:event:${eventId}`);
    });
  }

  async isUserTeamMember(userId: string, eventId: number): Promise<boolean> {
    console.log(`Verificando se usuário ${userId} é membro da equipe do evento ${eventId}`);
    
    try {
      // Usar explicitamente o nome correto da tabela no banco de dados: event_team_members
      const members = await db
        .select()
        .from(eventTeamMembers)
        .where(
          and(
            eq(eventTeamMembers.eventId, eventId),
            eq(eventTeamMembers.userId, userId)
          )
        );
      
      console.log(`Encontrados ${members.length} registros para o usuário na equipe`);
      console.log('Registros:', JSON.stringify(members));
      return members.length > 0;
    } catch (error) {
      console.error(`Erro ao verificar se usuário ${userId} é membro da equipe:`, error);
      return false;
    }
  }

  async hasUserAccessToEvent(userId: string, eventId: number): Promise<boolean> {
    return executeWithRetry(async () => {
      console.log(`Verificando acesso do usuário ${userId} ao evento ${eventId}`);
      
      if (!userId || userId === 'undefined') {
        console.log('UserId é undefined ou inválido');
        return false;
      }
      
      // Check if user is owner
      const [event] = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.id, eventId),
            eq(events.ownerId, userId)
          )
        );
      
      console.log(`Evento encontrado como proprietário:`, event ? 'SIM' : 'NÃO');
      
      if (event) {
        return true;
      }
      
      // Check if user is team member
      const isTeamMember = await this.isUserTeamMember(userId, eventId);
      console.log(`Usuário é membro da equipe:`, isTeamMember ? 'SIM' : 'NÃO');
      return isTeamMember;
    });
  }

  // Vendor operations
  async getVendorsByEventId(eventId: number): Promise<Vendor[]> {
    console.log(`Buscando fornecedores para o evento ${eventId}`);
    try {
      // Usar a abordagem do Drizzle para buscar os fornecedores
      const result = await db
        .select()
        .from(vendors)
        .where(eq(vendors.eventId, eventId));
      
      console.log(`Encontrados ${result.length} fornecedores para o evento ${eventId}`);
      console.log("Exemplo de fornecedor encontrado:", result.length > 0 ? result[0] : "Nenhum");
      return result;
    } catch (error) {
      console.error(`Erro ao buscar fornecedores para o evento ${eventId}:`, error);
      return [];
    }
  }
  
  async getVendorById(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, id));
    return vendor;
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(vendorData)
      .returning();
    return vendor;
  }

  async updateVendor(id: number, vendorData: Partial<InsertVendor>): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set({
        ...vendorData,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async deleteVendor(id: number): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Activity log operations
  async getActivityLogsByEventId(eventId: number): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.eventId, eventId))
      .orderBy(desc(activityLogs.createdAt));
  }

  async createActivityLog(activityLogData: InsertActivityLog): Promise<ActivityLog> {
    const [activityLog] = await db
      .insert(activityLogs)
      .values(activityLogData)
      .returning();
    return activityLog;
  }

  // Budget item operations
  async getBudgetItemsByEventId(eventId: number): Promise<BudgetItem[]> {
    return db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.eventId, eventId))
      .orderBy(desc(budgetItems.createdAt));
  }

  async getBudgetItemById(id: number): Promise<BudgetItem | undefined> {
    const [item] = await db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.id, id))
      .limit(1);
    return item;
  }

  async createBudgetItem(budgetItemData: InsertBudgetItem): Promise<BudgetItem> {
    const [item] = await db
      .insert(budgetItems)
      .values(budgetItemData)
      .returning();
    return item;
  }

  async updateBudgetItem(id: number, budgetItemData: Partial<InsertBudgetItem>): Promise<BudgetItem> {
    const [item] = await db
      .update(budgetItems)
      .set({
        ...budgetItemData,
        updatedAt: new Date()
      })
      .where(eq(budgetItems.id, id))
      .returning();
    return item;
  }

  async deleteBudgetItem(id: number): Promise<void> {
    await db.delete(budgetItems).where(eq(budgetItems.id, id));
  }

  // Expense operations
  async getExpensesByEventId(eventId: number): Promise<Expense[]> {
    return db
      .select()
      .from(expenses)
      .where(eq(expenses.eventId, eventId))
      .orderBy(desc(expenses.createdAt));
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    return expense;
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(expenseData)
      .returning();
      
    // Atualizar o total de despesas do evento
    const event = await this.getEventById(expenseData.eventId);
    if (event) {
      const totalExpenses = await this.calculateEventTotalExpenses(expenseData.eventId);
      await this.updateEvent(expenseData.eventId, { expenses: totalExpenses });
    }
    
    return expense;
  }

  async updateExpense(id: number, expenseData: Partial<InsertExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set({
        ...expenseData,
        updatedAt: new Date()
      })
      .where(eq(expenses.id, id))
      .returning();
      
    // Atualizar o total de despesas do evento, se necessário
    if (expenseData.amount !== undefined || expenseData.eventId !== undefined) {
      const eventId = expenseData.eventId !== undefined ? 
        expenseData.eventId : 
        expense.eventId;
      
      const totalExpenses = await this.calculateEventTotalExpenses(eventId);
      await this.updateEvent(eventId, { expenses: totalExpenses });
    }
    
    return expense;
  }

  async deleteExpense(id: number): Promise<void> {
    // Obter a despesa antes de excluí-la para saber o eventId
    const expense = await this.getExpenseById(id);
    if (expense) {
      await db.delete(expenses).where(eq(expenses.id, id));
      
      // Atualizar o total de despesas do evento
      const totalExpenses = await this.calculateEventTotalExpenses(expense.eventId);
      await this.updateEvent(expense.eventId, { expenses: totalExpenses });
    }
  }
  
  // Método auxiliar para calcular o total de despesas de um evento
  private async calculateEventTotalExpenses(eventId: number): Promise<number> {
    const allExpenses = await db
      .select({ total: sql`SUM(${expenses.amount})` })
      .from(expenses)
      .where(eq(expenses.eventId, eventId));
      
    return Number(allExpenses[0]?.total || 0);
  }
  
  // Task assignee operations
  async getTaskAssignees(taskId: number): Promise<(TaskAssignee & { user: User })[]> {
    return executeWithRetry(async () => {
      const assignees = await db
        .select()
        .from(taskAssignees)
        .where(eq(taskAssignees.taskId, taskId));
      
      // Get user details for each assignee
      return Promise.all(
        assignees.map(async (assignee) => {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, assignee.userId));
          
          return {
            ...assignee,
            user,
          };
        })
      );
    });
  }

  async addTaskAssignee(taskId: number, userId: string): Promise<TaskAssignee> {
    return executeWithRetry(async () => {
      // Check if already assigned
      const existingAssignees = await db
        .select()
        .from(taskAssignees)
        .where(
          and(
            eq(taskAssignees.taskId, taskId),
            eq(taskAssignees.userId, userId)
          )
        );
      
      if (existingAssignees.length > 0) {
        // Already assigned
        return existingAssignees[0];
      }
      
      // Add new assignee
      const [assignee] = await db
        .insert(taskAssignees)
        .values({
          taskId,
          userId,
        })
        .returning();
      
      // Get the task to invalidate cache
      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId));
        
      if (task && task.eventId) {
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
      
      return assignee;
    });
  }

  async removeTaskAssignee(taskId: number, userId: string): Promise<void> {
    return executeWithRetry(async () => {
      // Get the task to invalidate cache
      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId));
      
      await db
        .delete(taskAssignees)
        .where(
          and(
            eq(taskAssignees.taskId, taskId),
            eq(taskAssignees.userId, userId)
          )
        );
        
      if (task && task.eventId) {
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
    });
  }

  async replaceTaskAssignees(taskId: number, userIds: string[]): Promise<TaskAssignee[]> {
    return executeWithRetry(async () => {
      // Get the task to invalidate cache
      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId));
      
      // Remove all existing assignees
      await db
        .delete(taskAssignees)
        .where(eq(taskAssignees.taskId, taskId));
      
      if (!userIds || userIds.length === 0) {
        return [];
      }
      
      // Add all new assignees
      const assignees = await Promise.all(
        userIds.map(async (userId) => {
          const [assignee] = await db
            .insert(taskAssignees)
            .values({
              taskId,
              userId,
            })
            .returning();
          return assignee;
        })
      );
      
      if (task && task.eventId) {
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
      
      return assignees;
    });
  }
  
  // Task reminder operations
  async getTaskReminders(taskId: number): Promise<TaskReminder[]> {
    return executeWithRetry(async () => {
      // NOTA: Esta funcionalidade será implementada posteriormente
      return [];
    });
  }
  
  async getTaskRemindersByUser(userId: string): Promise<TaskReminder[]> {
    return executeWithRetry(async () => {
      // NOTA: Esta funcionalidade será implementada posteriormente
      return [];
    });
  }
  
  async createTaskReminder(reminderData: InsertTaskReminder): Promise<TaskReminder> {
    return executeWithRetry(async () => {
      // NOTA: Esta funcionalidade será implementada posteriormente
      return { id: 0, taskId: reminderData.taskId, userId: reminderData.userId, scheduledTime: new Date(), sent: false, createdAt: new Date() } as TaskReminder;
    });
  }
  
  async markReminderAsSent(id: number): Promise<TaskReminder> {
    return executeWithRetry(async () => {
      // NOTA: Esta funcionalidade será implementada posteriormente
      return { id: id, taskId: 0, userId: '', scheduledTime: new Date(), sent: true, sentAt: new Date(), createdAt: new Date(), updatedAt: new Date() } as TaskReminder;
    });
  }
  
  async deleteTaskReminder(id: number): Promise<void> {
    return executeWithRetry(async () => {
      // NOTA: Esta funcionalidade será implementada posteriormente
    });
  }

  // Document operations
  async getDocumentsByEventId(eventId: number): Promise<Document[]> {
    // Verificar cache
    const cacheKey = `documents:event:${eventId}`;
    const cachedDocuments = documentCache.get<Document[]>(cacheKey);
    if (cachedDocuments) return cachedDocuments;
    
    return executeWithRetry(async () => {
      const result = await db
        .select()
        .from(documents)
        .where(eq(documents.eventId, eventId))
        .orderBy(desc(documents.uploadedAt));
      
      // Armazenar em cache
      documentCache.set(cacheKey, result);
      return result;
    });
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    // Verificar cache
    const cacheKey = `document:${id}`;
    const cachedDocument = documentCache.get<Document>(cacheKey);
    if (cachedDocument) return cachedDocument;
    
    return executeWithRetry(async () => {
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id));
      
      // Armazenar em cache
      if (document) {
        documentCache.set(cacheKey, document);
      }
      
      return document;
    });
  }

  async getDocumentsByCategory(eventId: number, category: string): Promise<Document[]> {
    // Verificar cache
    const cacheKey = `documents:event:${eventId}:category:${category}`;
    const cachedDocuments = documentCache.get<Document[]>(cacheKey);
    if (cachedDocuments) return cachedDocuments;
    
    return executeWithRetry(async () => {
      const result = await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.eventId, eventId),
          eq(documents.category, category)
        ))
        .orderBy(desc(documents.uploadedAt));
      
      // Armazenar em cache
      documentCache.set(cacheKey, result);
      return result;
    });
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    return executeWithRetry(async () => {
      const [document] = await db
        .insert(documents)
        .values(documentData)
        .returning();
      
      // Invalidar e atualizar cache
      documentCache.invalidate(`documents:event:${documentData.eventId}`);
      documentCache.invalidate(`documents:event:${documentData.eventId}:category:${documentData.category}`);
      documentCache.set(`document:${document.id}`, document);
      
      return document;
    });
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document> {
    return executeWithRetry(async () => {
      const [document] = await db
        .update(documents)
        .set({
          ...documentData,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, id))
        .returning();
      
      // Invalidar e atualizar cache
      documentCache.invalidate(`documents:event:${document.eventId}`);
      documentCache.invalidate(`documents:event:${document.eventId}:category:${document.category}`);
      documentCache.set(`document:${document.id}`, document);
      
      return document;
    });
  }

  async deleteDocument(id: number): Promise<void> {
    return executeWithRetry(async () => {
      const document = await this.getDocumentById(id);
      
      if (document) {
        await db.delete(documents).where(eq(documents.id, id));
        
        // Invalidar cache
        documentCache.invalidate(`documents:event:${document.eventId}`);
        documentCache.invalidate(`documents:event:${document.eventId}:category:${document.category}`);
        documentCache.invalidate(`document:${id}`);
      }
    });
  }

  // Participant operations
  async getParticipantsByEventId(eventId: number): Promise<Participant[]> {
    // Verificar cache
    const cacheKey = `participants:event:${eventId}`;
    const cachedParticipants = participantCache.get<Participant[]>(cacheKey);
    if (cachedParticipants) return cachedParticipants;
    
    return executeWithRetry(async () => {
      const result = await db
        .select()
        .from(participants)
        .where(eq(participants.eventId, eventId))
        .orderBy(participants.name);
      
      // Armazenar em cache
      participantCache.set(cacheKey, result);
      return result;
    });
  }

  async getParticipantById(id: number): Promise<Participant | undefined> {
    // Verificar cache
    const cacheKey = `participant:${id}`;
    const cachedParticipant = participantCache.get<Participant>(cacheKey);
    if (cachedParticipant) return cachedParticipant;
    
    return executeWithRetry(async () => {
      const [participant] = await db.select().from(participants).where(eq(participants.id, id));
      
      // Armazenar em cache
      if (participant) {
        participantCache.set(cacheKey, participant);
      }
      
      return participant;
    });
  }

  async createParticipant(participantData: InsertParticipant): Promise<Participant> {
    return executeWithRetry(async () => {
      const [participant] = await db.insert(participants).values(participantData).returning();
      
      // Invalidar e atualizar cache
      participantCache.invalidate(`participants:event:${participantData.eventId}`);
      participantCache.set(`participant:${participant.id}`, participant);
      
      return participant;
    });
  }

  async createParticipants(participantsData: InsertParticipant[]): Promise<Participant[]> {
    return executeWithRetry(async () => {
      const createdParticipants = await db.insert(participants).values(participantsData).returning();
      
      // Invalidar cache para todos os eventos afetados
      const eventIds = [...new Set(participantsData.map(p => p.eventId))];
      eventIds.forEach(eventId => {
        participantCache.invalidate(`participants:event:${eventId}`);
      });
      
      // Armazenar em cache individual
      createdParticipants.forEach(participant => {
        participantCache.set(`participant:${participant.id}`, participant);
      });
      
      return createdParticipants;
    });
  }

  async updateParticipant(id: number, participantData: Partial<InsertParticipant>): Promise<Participant> {
    return executeWithRetry(async () => {
      const [participant] = await db
        .update(participants)
        .set({
          ...participantData,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, id))
        .returning();
      
      // Invalidar e atualizar cache
      participantCache.invalidate(`participants:event:${participant.eventId}`);
      participantCache.set(`participant:${participant.id}`, participant);
      
      return participant;
    });
  }

  async deleteParticipant(id: number): Promise<void> {
    return executeWithRetry(async () => {
      const participant = await this.getParticipantById(id);
      
      if (participant) {
        await db.delete(participants).where(eq(participants.id, id));
        
        // Invalidar cache
        participantCache.invalidate(`participants:event:${participant.eventId}`);
        participantCache.invalidate(`participant:${id}`);
      }
    });
  }

  async getParticipantStats(eventId: number): Promise<{ total: number; confirmed: number; pending: number }> {
    return executeWithRetry(async () => {
      const eventParticipants = await this.getParticipantsByEventId(eventId);
      
      const total = eventParticipants.length;
      const confirmed = eventParticipants.filter(p => p.status === 'confirmed').length;
      const pending = eventParticipants.filter(p => p.status === 'pending').length;
      
      return { total, confirmed, pending };
    });
  }

  // Feedback operations
  async getFeedbacksByEventId(eventId: number): Promise<EventFeedback[]> {
    return executeWithRetry(async () => {
      const feedbacks = await db
        .select()
        .from(eventFeedbacks)
        .where(eq(eventFeedbacks.eventId, eventId))
        .orderBy(desc(eventFeedbacks.createdAt));
      
      return feedbacks;
    });
  }

  async getFeedbackByFeedbackId(feedbackId: string): Promise<(EventFeedback & { event: Event }) | undefined> {
    return executeWithRetry(async () => {
      const [result] = await db
        .select({
          id: eventFeedbacks.id,
          eventId: eventFeedbacks.eventId,
          feedbackId: eventFeedbacks.feedbackId,
          name: eventFeedbacks.name,
          email: eventFeedbacks.email,
          rating: eventFeedbacks.rating,
          comment: eventFeedbacks.comment,
          isAnonymous: eventFeedbacks.isAnonymous,
          createdAt: eventFeedbacks.createdAt,
          event: events
        })
        .from(eventFeedbacks)
        .innerJoin(events, eq(eventFeedbacks.eventId, events.id))
        .where(eq(eventFeedbacks.feedbackId, feedbackId));
      
      return result;
    });
  }

  async createFeedback(feedbackData: InsertEventFeedback): Promise<EventFeedback> {
    return executeWithRetry(async () => {
      const [feedback] = await db
        .insert(eventFeedbacks)
        .values(feedbackData)
        .returning();
      
      return feedback;
    });
  }

  async deleteFeedback(id: number): Promise<void> {
    return executeWithRetry(async () => {
      await db.delete(eventFeedbacks).where(eq(eventFeedbacks.id, id));
    });
  }

  async generateFeedbackLink(eventId: number): Promise<string> {
    return executeWithRetry(async () => {
      // Gerar um ID único para o feedback
      const feedbackId = `feedback_${eventId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Verificar se já existe um feedbackId para este evento
      const existingFeedback = await db
        .select()
        .from(eventFeedbacks)
        .where(and(eq(eventFeedbacks.eventId, eventId), isNotNull(eventFeedbacks.feedbackId)))
        .limit(1);
      
      if (existingFeedback.length > 0) {
        // Se já existe um link, retornar o feedbackId existente
        return existingFeedback[0].feedbackId!;
      }
      
      return feedbackId;
    });
  }

  async getFeedbackStats(eventId: number): Promise<{ total: number; averageRating: number; anonymousPercentage: number }> {
    return executeWithRetry(async () => {
      const feedbacks = await db
        .select()
        .from(eventFeedbacks)
        .where(and(eq(eventFeedbacks.eventId, eventId), sql`${eventFeedbacks.rating} > 0`));

      const total = feedbacks.length;
      if (total === 0) {
        return { total: 0, averageRating: 0, anonymousPercentage: 0 };
      }

      const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = totalRating / total;
      
      const anonymousCount = feedbacks.filter(feedback => feedback.isAnonymous).length;
      const anonymousPercentage = (anonymousCount / total) * 100;

      return {
        total,
        averageRating: Math.round(averageRating * 10) / 10,
        anonymousPercentage: Math.round(anonymousPercentage)
      };
    });
  }

  async createFeedbackMetric(metric: InsertFeedbackMetrics): Promise<FeedbackMetrics> {
    return executeWithRetry(async () => {
      const [result] = await db
        .insert(feedbackMetrics)
        .values(metric)
        .returning();
      
      return result;
    });
  }

  async updateFeedbackMetricSubmission(feedbackId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    return executeWithRetry(async () => {
      await db
        .update(feedbackMetrics)
        .set({
          submittedAt: new Date(),
          ipAddress,
          userAgent
        })
        .where(eq(feedbackMetrics.feedbackId, feedbackId));
    });
  }

  async getEventByFeedbackId(feedbackId: string): Promise<Event | undefined> {
    return executeWithRetry(async () => {
      const [result] = await db
        .select({
          event: events
        })
        .from(eventFeedbacks)
        .innerJoin(events, eq(eventFeedbacks.eventId, events.id))
        .where(eq(eventFeedbacks.feedbackId, feedbackId));
      
      return result?.event;
    });
  }

  async getEventFeedbackByFeedbackId(feedbackId: string): Promise<{ eventId: number; feedbackId: string } | undefined> {
    return executeWithRetry(async () => {
      const [result] = await db
        .select({
          eventId: eventFeedbacks.eventId,
          feedbackId: eventFeedbacks.feedbackId
        })
        .from(eventFeedbacks)
        .where(eq(eventFeedbacks.feedbackId, feedbackId));
      
      return result;
    });
  }

  async getEventFeedbacks(eventId: number): Promise<EventFeedback[]> {
    return executeWithRetry(async () => {
      const results = await db
        .select()
        .from(eventFeedbacks)
        .where(and(
          eq(eventFeedbacks.eventId, eventId),
          sql`${eventFeedbacks.rating} > 0`
        ))
        .orderBy(desc(eventFeedbacks.createdAt));
      
      console.log(`[DEBUG] Encontrados ${results.length} feedbacks válidos para evento ${eventId}`);
      return results;
    });
  }

  async deleteFeedback(feedbackId: number): Promise<void> {
    return executeWithRetry(async () => {
      await db
        .delete(eventFeedbacks)
        .where(eq(eventFeedbacks.id, feedbackId));
    });
  }

  async generateFeedbackLink(eventId: number): Promise<string> {
    return executeWithRetry(async () => {
      // Verificar se já existe um link
      const [existingEvent] = await db
        .select({ feedbackUrl: events.feedbackUrl })
        .from(events)
        .where(eq(events.id, eventId));

      if (existingEvent?.feedbackUrl) {
        return existingEvent.feedbackUrl;
      }

      // Gerar novo link único
      const feedbackId = `feedback_${eventId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const feedbackUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://symera.replit.app'}/feedback/${feedbackId}`;

      // Salvar o link no evento
      await db
        .update(events)
        .set({ feedbackUrl })
        .where(eq(events.id, eventId));

      console.log(`[DEBUG] Link de feedback gerado: ${feedbackUrl} para evento ${eventId}`);
      return feedbackUrl;
    });
  }

  async getExistingFeedbackLink(eventId: number): Promise<string | null> {
    return executeWithRetry(async () => {
      const [event] = await db
        .select({ feedbackUrl: events.feedbackUrl })
        .from(events)
        .where(eq(events.id, eventId));

      return event?.feedbackUrl || null;
    });
  }
}

export const storage = new DatabaseStorage();
