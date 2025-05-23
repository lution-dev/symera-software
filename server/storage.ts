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
  taskReminders,
  type User,
  type Event,
  type Task,
  type EventTeamMember,
  type Vendor,
  type ActivityLog,
  type BudgetItem,
  type Expense,
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
  type TaskReminder,
  type InsertTaskReminder,
} from "@shared/schema";
import { db, executeWithRetry } from "./db";
import { eq, and, or, desc, gte, lte, sql } from "drizzle-orm";

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

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
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

  async findOrCreateUserByEmail(email: string): Promise<User> {
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
      
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id: `local-${Date.now()}`, // Generate a temporary ID for non-OAuth users
          email,
          firstName: email.split('@')[0], // Use part of email as name
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
    await db
      .delete(eventTeamMembers)
      .where(
        and(
          eq(eventTeamMembers.eventId, eventId),
          eq(eventTeamMembers.userId, userId)
        )
      );
  }

  async isUserTeamMember(userId: string, eventId: number): Promise<boolean> {
    console.log(`Verificando se usuário ${userId} é membro da equipe do evento ${eventId}`);
    
    try {
      const teamMembers = await db
        .select()
        .from(eventTeamMembers)
        .where(
          and(
            eq(eventTeamMembers.eventId, eventId),
            eq(eventTeamMembers.userId, userId)
          )
        );
      
      console.log(`Encontrados ${teamMembers.length} registros para o usuário na equipe`);
      console.log('Registros:', JSON.stringify(teamMembers));
      return teamMembers.length > 0;
    } catch (error) {
      console.error(`Erro ao verificar se usuário ${userId} é membro da equipe:`, error);
      return false;
    }
  }

  async hasUserAccessToEvent(userId: string, eventId: number): Promise<boolean> {
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
    
    if (event) {
      return true;
    }
    
    // Check if user is team member
    return this.isUserTeamMember(userId, eventId);
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
      const reminders = await db
        .select()
        .from(taskReminders)
        .where(eq(taskReminders.taskId, taskId))
        .orderBy(taskReminders.scheduledTime);
      
      return reminders;
    });
  }
  
  async getTaskRemindersByUser(userId: string): Promise<TaskReminder[]> {
    return executeWithRetry(async () => {
      const reminders = await db
        .select()
        .from(taskReminders)
        .where(eq(taskReminders.userId, userId))
        .orderBy(taskReminders.scheduledTime);
      
      return reminders;
    });
  }
  
  async createTaskReminder(reminderData: InsertTaskReminder): Promise<TaskReminder> {
    return executeWithRetry(async () => {
      const [reminder] = await db.insert(taskReminders).values(reminderData).returning();
      return reminder;
    });
  }
  
  async markReminderAsSent(id: number): Promise<TaskReminder> {
    return executeWithRetry(async () => {
      const [reminder] = await db
        .update(taskReminders)
        .set({
          sent: true,
          sentAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(taskReminders.id, id))
        .returning();
      
      return reminder;
    });
  }
  
  async deleteTaskReminder(id: number): Promise<void> {
    return executeWithRetry(async () => {
      await db
        .delete(taskReminders)
        .where(eq(taskReminders.id, id));
    });
  }
}

export const storage = new DatabaseStorage();
