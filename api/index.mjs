import { createRequire } from 'module';
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirname_fn } from 'path';
const require = createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_fn(__filename);
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  budgetItems: () => budgetItems,
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  eventFeedbacks: () => eventFeedbacks,
  eventFeedbacksRelations: () => eventFeedbacksRelations,
  eventFormSchema: () => eventFormSchema,
  eventTeamMembers: () => eventTeamMembers,
  events: () => events,
  eventsRelations: () => eventsRelations,
  expenseFormSchema: () => expenseFormSchema,
  expenses: () => expenses,
  feedbackMetrics: () => feedbackMetrics,
  feedbackMetricsRelations: () => feedbackMetricsRelations,
  insertBudgetItemSchema: () => insertBudgetItemSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertEventActivitySchema: () => insertEventActivitySchema,
  insertEventFeedbackSchema: () => insertEventFeedbackSchema,
  insertEventSchema: () => insertEventSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertFeedbackMetricsSchema: () => insertFeedbackMetricsSchema,
  insertParticipantSchema: () => insertParticipantSchema,
  insertScheduleItemSchema: () => insertScheduleItemSchema,
  insertTaskAssigneeSchema: () => insertTaskAssigneeSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTeamMemberSchema: () => insertTeamMemberSchema,
  insertUserSchema: () => insertUserSchema,
  insertVendorSchema: () => insertVendorSchema,
  participants: () => participants,
  participantsRelations: () => participantsRelations,
  scheduleItems: () => scheduleItems,
  scheduleItemsRelations: () => scheduleItemsRelations,
  taskAssignees: () => taskAssignees,
  tasks: () => tasks,
  users: () => users,
  vendors: () => vendors
});
import { relations } from "drizzle-orm";
import { text, integer, pgTable, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, events, tasks, taskAssignees, activityLogs, eventTeamMembers, vendors, budgetItems, expenses, scheduleItems, documents, participants, eventFeedbacks, feedbackMetrics, scheduleItemsRelations, documentsRelations, participantsRelations, eventFeedbacksRelations, feedbackMetricsRelations, insertUserSchema, insertEventSchema, eventFormSchema, insertTaskSchema, insertTaskAssigneeSchema, insertEventActivitySchema, insertTeamMemberSchema, insertVendorSchema, insertScheduleItemSchema, insertBudgetItemSchema, insertExpenseSchema, expenseFormSchema, insertDocumentSchema, insertParticipantSchema, insertEventFeedbackSchema, insertFeedbackMetricsSchema, eventsRelations;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: text("id").primaryKey(),
      email: text("email").notNull().unique(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      phone: text("phone"),
      profileImageUrl: text("profile_image_url"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    events = pgTable("events", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      type: text("type").notNull(),
      format: text("format").notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      startTime: text("start_time"),
      endTime: text("end_time"),
      location: text("location"),
      meetingUrl: text("meeting_url"),
      description: text("description"),
      budget: integer("budget"),
      expenses: integer("expenses").default(0),
      attendees: integer("attendees"),
      coverImageUrl: text("cover_image_url"),
      status: text("status").default("planning"),
      feedbackUrl: text("feedback_url"),
      ownerId: text("owner_id").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    tasks = pgTable("tasks", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      dueDate: timestamp("due_date"),
      status: text("status").default("todo").notNull(),
      priority: text("priority").default("medium").notNull(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      assigneeId: text("assignee_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    taskAssignees = pgTable("task_assignees", {
      id: serial("id").primaryKey(),
      taskId: integer("task_id").references(() => tasks.id).notNull(),
      userId: text("user_id").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    activityLogs = pgTable("activity_logs", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      userId: text("user_id").references(() => users.id).notNull(),
      action: text("action").notNull(),
      details: text("details"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    eventTeamMembers = pgTable("event_team_members", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      userId: text("user_id").references(() => users.id).notNull(),
      role: text("role").notNull(),
      permissions: text("permissions"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    vendors = pgTable("vendors", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      contactName: text("contact_name"),
      contactEmail: text("contact_email"),
      contactPhone: text("contact_phone"),
      service: text("service").notNull(),
      cost: integer("cost"),
      notes: text("notes"),
      eventId: integer("event_id").references(() => events.id).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    budgetItems = pgTable("budget_items", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      name: text("name").notNull(),
      amount: integer("amount").notNull(),
      category: text("category"),
      dueDate: timestamp("due_date"),
      paid: boolean("paid").default(false),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    expenses = pgTable("expenses", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      name: text("name").notNull(),
      amount: integer("amount").notNull(),
      category: text("category"),
      dueDate: timestamp("due_date"),
      paymentDate: timestamp("payment_date"),
      paid: boolean("paid").default(false),
      notes: text("notes"),
      vendorId: integer("vendor_id").references(() => vendors.id),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    scheduleItems = pgTable("schedule_items", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      title: text("title").notNull(),
      description: text("description"),
      eventDate: timestamp("event_date"),
      startTime: text("start_time").notNull(),
      location: text("location"),
      responsibles: text("responsibles"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    documents = pgTable("documents", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      name: text("name").notNull(),
      category: text("category").notNull(),
      description: text("description"),
      fileUrl: text("file_url").notNull(),
      fileType: text("file_type").notNull(),
      uploadedById: text("uploaded_by_id").references(() => users.id).notNull(),
      uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    participants = pgTable("participants", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      name: text("name").notNull(),
      email: text("email"),
      phone: text("phone"),
      status: text("status").default("pending").notNull(),
      origin: text("origin").default("manual").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    eventFeedbacks = pgTable("event_feedbacks", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").references(() => events.id).notNull(),
      feedbackId: text("feedback_id").notNull().unique(),
      name: text("name"),
      email: text("email"),
      rating: integer("rating").notNull(),
      comment: text("comment").notNull(),
      isAnonymous: boolean("is_anonymous").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    feedbackMetrics = pgTable("feedback_metrics", {
      id: serial("id").primaryKey(),
      feedbackId: text("feedback_id").references(() => eventFeedbacks.feedbackId).notNull(),
      viewedAt: timestamp("viewed_at"),
      submittedAt: timestamp("submitted_at"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    scheduleItemsRelations = relations(scheduleItems, ({ one }) => ({
      event: one(events, {
        fields: [scheduleItems.eventId],
        references: [events.id]
      })
    }));
    documentsRelations = relations(documents, ({ one }) => ({
      event: one(events, {
        fields: [documents.eventId],
        references: [events.id]
      }),
      uploadedBy: one(users, {
        fields: [documents.uploadedById],
        references: [users.id]
      })
    }));
    participantsRelations = relations(participants, ({ one }) => ({
      event: one(events, {
        fields: [participants.eventId],
        references: [events.id]
      })
    }));
    eventFeedbacksRelations = relations(eventFeedbacks, ({ one, many }) => ({
      event: one(events, {
        fields: [eventFeedbacks.eventId],
        references: [events.id]
      }),
      metrics: many(feedbackMetrics)
    }));
    feedbackMetricsRelations = relations(feedbackMetrics, ({ one }) => ({
      feedback: one(eventFeedbacks, {
        fields: [feedbackMetrics.feedbackId],
        references: [eventFeedbacks.feedbackId]
      })
    }));
    insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
    insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, updatedAt: true });
    eventFormSchema = z.object({
      name: z.string().min(1, "Nome \xE9 obrigat\xF3rio"),
      type: z.string().min(1, "Tipo \xE9 obrigat\xF3rio"),
      format: z.string().min(1, "Formato \xE9 obrigat\xF3rio"),
      startDate: z.string().min(1, "Data de in\xEDcio \xE9 obrigat\xF3ria"),
      endDate: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      location: z.string().optional(),
      meetingUrl: z.string().optional(),
      description: z.string().optional(),
      budget: z.number().optional(),
      attendees: z.number().optional(),
      coverImageUrl: z.string().optional(),
      status: z.string().optional(),
      feedbackUrl: z.string().optional(),
      generateAIChecklist: z.boolean().optional()
    });
    insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
    insertTaskAssigneeSchema = createInsertSchema(taskAssignees).omit({ id: true, createdAt: true });
    insertEventActivitySchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
    insertTeamMemberSchema = createInsertSchema(eventTeamMembers).omit({ id: true, createdAt: true });
    insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true, updatedAt: true });
    insertScheduleItemSchema = createInsertSchema(scheduleItems).omit({ id: true, createdAt: true, updatedAt: true });
    insertBudgetItemSchema = createInsertSchema(budgetItems).omit({ id: true, createdAt: true, updatedAt: true });
    insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true, updatedAt: true });
    expenseFormSchema = insertExpenseSchema.extend({
      dueDate: z.string().optional(),
      paymentDate: z.string().optional()
    });
    insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true, uploadedAt: true });
    insertParticipantSchema = createInsertSchema(participants).omit({ id: true, createdAt: true, updatedAt: true });
    insertEventFeedbackSchema = createInsertSchema(eventFeedbacks).omit({ id: true, createdAt: true });
    insertFeedbackMetricsSchema = createInsertSchema(feedbackMetrics).omit({ id: true, createdAt: true });
    eventsRelations = relations(events, ({ one, many }) => ({
      owner: one(users, {
        fields: [events.ownerId],
        references: [users.id]
      }),
      tasks: many(tasks),
      teamMembers: many(eventTeamMembers),
      activities: many(activityLogs),
      scheduleItems: many(scheduleItems),
      budgetItems: many(budgetItems),
      expenses: many(expenses),
      documents: many(documents),
      participants: many(participants),
      feedbacks: many(eventFeedbacks)
    }));
  }
});

// server/devMode.ts
var devMode_exports = {};
__export(devMode_exports, {
  devModeAuth: () => devModeAuth,
  ensureDevAuth: () => ensureDevAuth
});
var devModeAuth, ensureDevAuth;
var init_devMode = __esm({
  "server/devMode.ts"() {
    "use strict";
    devModeAuth = async (req, res, next) => {
      return next();
    };
    ensureDevAuth = async (req, res, next) => {
      return next();
    };
  }
});

// api/_handler.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import express from "express";
import path2 from "path";
import multer from "multer";
import fs2 from "fs";

// server/storage.ts
init_schema();

// server/db.ts
init_schema();
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  // limite máximo de conexões no pool
  idleTimeoutMillis: 3e4,
  // tempo para fechar conexões inativas (30s)
  connectionTimeoutMillis: 5e3,
  // tempo máximo para estabelecer conexão (5s)
  ssl: {
    rejectUnauthorized: false
  }
});
var db = drizzle(pool, { schema: schema_exports });
async function executeWithRetry(operation, maxRetries = 3, delay = 1e3) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error.message?.includes("rate limit") || error.message?.includes("Control plane request failed")) {
        if (attempt < maxRetries) {
          console.log(`Retrying database operation after error: ${error.message}`);
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
          continue;
        }
      } else {
        break;
      }
    }
  }
  throw lastError;
}

// server/storage.ts
import { eq, and, desc, sql, isNotNull } from "drizzle-orm";
var MemoryCache = class {
  cache;
  ttl;
  // Tempo de vida do cache em ms
  constructor(ttlMs = 6e4) {
    this.cache = /* @__PURE__ */ new Map();
    this.ttl = ttlMs;
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return void 0;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return void 0;
    }
    return entry.data;
  }
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  invalidate(prefix) {
    Array.from(this.cache.keys()).forEach((key) => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    });
  }
};
var userCache = new MemoryCache(3e5);
var eventCache = new MemoryCache(18e4);
var taskCache = new MemoryCache(12e4);
var documentCache = new MemoryCache(12e4);
var participantCache = new MemoryCache(12e4);
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const cacheKey = `user:${id}`;
    const cachedUser = userCache.get(cacheKey);
    if (cachedUser) return cachedUser;
    return executeWithRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        userCache.set(cacheKey, user);
      }
      return user;
    });
  }
  async getAllUsers() {
    const cacheKey = "all:users";
    const cachedUsers = userCache.get(cacheKey);
    if (cachedUsers) return cachedUsers;
    return executeWithRetry(async () => {
      const allUsers = await db.select().from(users);
      userCache.set(cacheKey, allUsers);
      return allUsers;
    });
  }
  async getUserByEmail(email) {
    const cacheKey = `user:email:${email}`;
    const cachedUser = userCache.get(cacheKey);
    if (cachedUser) return cachedUser;
    return executeWithRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (user) {
        userCache.set(cacheKey, user);
        userCache.set(`user:${user.id}`, user);
      }
      return user;
    });
  }
  async upsertUser(userData) {
    return executeWithRetry(async () => {
      const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: /* @__PURE__ */ new Date()
        }
      }).returning();
      userCache.invalidate(`user:${user.id}`);
      userCache.set(`user:${user.id}`, user);
      return user;
    });
  }
  async findOrCreateUserByEmail(email, name, phone) {
    const cacheKey = `user:email:${email}`;
    const cachedUser = userCache.get(cacheKey);
    if (cachedUser) return cachedUser;
    return executeWithRetry(async () => {
      const existingUsers = await db.select().from(users).where(eq(users.email, email));
      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        userCache.set(`user:${user.id}`, user);
        userCache.set(cacheKey, user);
        return user;
      }
      const nameParts = name ? name.trim().split(" ") : email.split("@")[0].split(".");
      const firstName = nameParts[0] || email.split("@")[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const [newUser] = await db.insert(users).values({
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName: lastName || "",
        phone: phone || void 0,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      userCache.set(`user:${newUser.id}`, newUser);
      userCache.set(cacheKey, newUser);
      return newUser;
    });
  }
  async migrateUserFromLocalToReplit(localUserId, replitUserId) {
    return executeWithRetry(async () => {
      console.log(`Migrando usu\xE1rio de ${localUserId} para ${replitUserId}`);
      const existingNewUser = await db.select().from(users).where(eq(users.id, replitUserId));
      if (existingNewUser.length > 0) {
        console.log(`Usu\xE1rio com ID ${replitUserId} j\xE1 existe. Apenas migrando refer\xEAncias.`);
        await Promise.all([
          db.update(eventTeamMembers).set({ userId: replitUserId }).where(eq(eventTeamMembers.userId, localUserId)),
          db.update(events).set({ ownerId: replitUserId }).where(eq(events.ownerId, localUserId)),
          db.update(taskAssignees).set({ userId: replitUserId }).where(eq(taskAssignees.userId, localUserId)),
          db.update(documents).set({ uploadedById: replitUserId }).where(eq(documents.uploadedById, localUserId)),
          db.update(activityLogs).set({ userId: replitUserId }).where(eq(activityLogs.userId, localUserId))
        ]);
        try {
          await db.delete(users).where(eq(users.id, localUserId));
          console.log(`Usu\xE1rio antigo ${localUserId} removido.`);
        } catch (deleteError) {
          console.log(`N\xE3o foi poss\xEDvel deletar usu\xE1rio antigo ${localUserId}:`, deleteError);
        }
      } else {
        console.log(`Atualizando ID do usu\xE1rio de ${localUserId} para ${replitUserId}`);
        await Promise.all([
          db.update(eventTeamMembers).set({ userId: replitUserId }).where(eq(eventTeamMembers.userId, localUserId)),
          db.update(events).set({ ownerId: replitUserId }).where(eq(events.ownerId, localUserId)),
          db.update(taskAssignees).set({ userId: replitUserId }).where(eq(taskAssignees.userId, localUserId)),
          db.update(documents).set({ uploadedById: replitUserId }).where(eq(documents.uploadedById, localUserId)),
          db.update(activityLogs).set({ userId: replitUserId }).where(eq(activityLogs.userId, localUserId))
        ]);
        await db.update(users).set({ id: replitUserId, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, localUserId));
      }
      userCache.invalidate(`user:${localUserId}`);
      userCache.invalidate(`user:${replitUserId}`);
      userCache.invalidate(`user:email:`);
      eventCache.invalidate(`events:user:${localUserId}`);
      eventCache.invalidate(`events:user:${replitUserId}`);
      eventCache.invalidate(`events:`);
      console.log(`Migra\xE7\xE3o conclu\xEDda de ${localUserId} para ${replitUserId}`);
    });
  }
  // Event operations
  async getEventsByUser(userId) {
    const cacheKey = `events:user:${userId}`;
    const cachedEvents = eventCache.get(cacheKey);
    if (cachedEvents) return cachedEvents;
    return executeWithRetry(async () => {
      const ownedEvents = await db.select().from(events).where(eq(events.ownerId, userId)).orderBy(desc(events.startDate));
      const teamMemberships = await db.select({
        eventId: eventTeamMembers.eventId
      }).from(eventTeamMembers).where(eq(eventTeamMembers.userId, userId));
      const teamEventIds = teamMemberships.map((tm) => tm.eventId);
      if (teamEventIds.length === 0) {
        const eventsWithTeamAndTasks2 = await Promise.all(
          ownedEvents.map(async (event) => {
            const teamMembers = await this.getTeamMembersByEventId(event.id);
            const tasks2 = await this.getTasksByEventId(event.id);
            return {
              ...event,
              team: teamMembers,
              tasks: tasks2
            };
          })
        );
        eventCache.set(cacheKey, eventsWithTeamAndTasks2);
        return eventsWithTeamAndTasks2;
      }
      let teamEvents = [];
      if (teamEventIds.length > 0) {
        if (teamEventIds.length === 1) {
          teamEvents = await db.select().from(events).where(eq(events.id, teamEventIds[0]));
        } else {
          const batchResults = await Promise.all(
            teamEventIds.map(
              (id) => db.select().from(events).where(eq(events.id, id))
            )
          );
          teamEvents = batchResults.flat();
        }
      }
      const allEvents = [...ownedEvents];
      for (const event of teamEvents) {
        if (event && !allEvents.some((e) => e.id === event.id)) {
          allEvents.push(event);
        }
      }
      const sortedEvents = allEvents.sort((a, b) => {
        const dateA = a.startDate;
        const dateB = b.startDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      const eventsWithTeamAndTasks = await Promise.all(
        sortedEvents.map(async (event) => {
          const teamMembers = await this.getTeamMembersByEventId(event.id);
          const tasks2 = await this.getTasksByEventId(event.id);
          return {
            ...event,
            team: teamMembers,
            tasks: tasks2
          };
        })
      );
      eventCache.set(cacheKey, eventsWithTeamAndTasks);
      return eventsWithTeamAndTasks;
    });
  }
  async getEventById(id) {
    return executeWithRetry(async () => {
      const [event] = await db.select().from(events).where(eq(events.id, id));
      console.log(`Evento ${id} recuperado diretamente do banco:`, event);
      return event;
    });
  }
  async createEvent(eventData) {
    return executeWithRetry(async () => {
      const [event] = await db.insert(events).values(eventData).returning();
      eventCache.invalidate(`events:user:${eventData.ownerId}`);
      eventCache.set(`event:${event.id}`, event);
      return event;
    });
  }
  async updateEvent(id, eventData) {
    return executeWithRetry(async () => {
      console.log("Atualizando evento com dados:", JSON.stringify(eventData, null, 2));
      console.log("Formato do evento recebido:", eventData.format);
      console.log("MeetingUrl recebido:", eventData.meetingUrl);
      let dataToUpdate = {
        ...eventData,
        updatedAt: /* @__PURE__ */ new Date()
      };
      console.log("Dados a serem salvos:", JSON.stringify(dataToUpdate, null, 2));
      const [event] = await db.update(events).set(dataToUpdate).where(eq(events.id, id)).returning();
      console.log("Evento atualizado no banco:", JSON.stringify(event, null, 2));
      eventCache.invalidate(`event:${id}`);
      eventCache.invalidate(`events:user:`);
      eventCache.invalidate(`events:`);
      return event;
    });
  }
  async deleteEvent(id) {
    return executeWithRetry(async () => {
      const [event] = await db.select().from(events).where(eq(events.id, id));
      await db.delete(events).where(eq(events.id, id));
      eventCache.invalidate(`event:${id}`);
      if (event) {
        eventCache.invalidate(`events:user:${event.ownerId}`);
      }
      eventCache.invalidate(`events:user:`);
    });
  }
  // Task operations
  async getTasksByEventId(eventId) {
    const cacheKey = `tasks:event:${eventId}`;
    const cachedTasks = taskCache.get(cacheKey);
    if (cachedTasks) return cachedTasks;
    return executeWithRetry(async () => {
      const result = await db.select().from(tasks).where(eq(tasks.eventId, eventId)).orderBy(tasks.dueDate);
      taskCache.set(cacheKey, result);
      return result;
    });
  }
  async getTaskById(id) {
    const cacheKey = `task:${id}`;
    const cachedTask = taskCache.get(cacheKey);
    if (cachedTask) return cachedTask;
    return executeWithRetry(async () => {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      if (task) {
        taskCache.set(cacheKey, task);
      }
      return task;
    });
  }
  async createTask(taskData, assigneeIds) {
    return executeWithRetry(async () => {
      const [task] = await db.insert(tasks).values(taskData).returning();
      if (assigneeIds && assigneeIds.length > 0) {
        await this.replaceTaskAssignees(task.id, assigneeIds);
      }
      taskCache.invalidate(`tasks:event:${taskData.eventId}`);
      taskCache.set(`task:${task.id}`, task);
      return task;
    });
  }
  async updateTask(id, taskData, assigneeIds) {
    return executeWithRetry(async () => {
      const [task] = await db.update(tasks).set({
        ...taskData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(tasks.id, id)).returning();
      if (assigneeIds !== void 0) {
        await this.replaceTaskAssignees(task.id, assigneeIds);
      }
      taskCache.set(`task:${id}`, task);
      if (taskData.eventId) {
        const oldTask = await this.getTaskById(id);
        if (oldTask && oldTask.eventId !== taskData.eventId) {
          taskCache.invalidate(`tasks:event:${oldTask.eventId}`);
        }
        taskCache.invalidate(`tasks:event:${taskData.eventId}`);
      } else {
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
      return task;
    });
  }
  async deleteTask(id) {
    return executeWithRetry(async () => {
      const task = await this.getTaskById(id);
      await db.delete(tasks).where(eq(tasks.id, id));
      taskCache.invalidate(`task:${id}`);
      if (task) {
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
    });
  }
  // Team member operations
  async getTeamMembersByEventId(eventId) {
    const teamMembers = await db.select().from(eventTeamMembers).where(eq(eventTeamMembers.eventId, eventId));
    return Promise.all(
      teamMembers.map(async (member) => {
        const [user] = await db.select().from(users).where(eq(users.id, member.userId));
        let parsedPermissions = member.permissions;
        if (typeof parsedPermissions === "string") {
          try {
            parsedPermissions = JSON.parse(parsedPermissions);
          } catch {
            parsedPermissions = {};
          }
        }
        return {
          ...member,
          permissions: parsedPermissions,
          user
        };
      })
    );
  }
  async addTeamMember(teamMemberData) {
    const existingMembers = await db.select().from(eventTeamMembers).where(
      and(
        eq(eventTeamMembers.eventId, teamMemberData.eventId),
        eq(eventTeamMembers.userId, teamMemberData.userId)
      )
    );
    if (existingMembers.length > 0) {
      const [teamMember2] = await db.update(eventTeamMembers).set({
        role: teamMemberData.role,
        permissions: teamMemberData.permissions
      }).where(
        and(
          eq(eventTeamMembers.eventId, teamMemberData.eventId),
          eq(eventTeamMembers.userId, teamMemberData.userId)
        )
      ).returning();
      return teamMember2;
    }
    const [teamMember] = await db.insert(eventTeamMembers).values(teamMemberData).returning();
    return teamMember;
  }
  async removeTeamMember(eventId, userId) {
    return executeWithRetry(async () => {
      const result = await db.delete(eventTeamMembers).where(
        and(
          eq(eventTeamMembers.eventId, eventId),
          eq(eventTeamMembers.userId, userId)
        )
      );
      console.log(`Removendo membro da equipe - EventId: ${eventId}, UserId: ${userId}, Linhas afetadas:`, result);
      userCache.invalidate(`team:event:${eventId}`);
    });
  }
  async isUserTeamMember(userId, eventId) {
    console.log(`Verificando se usu\xE1rio ${userId} \xE9 membro da equipe do evento ${eventId}`);
    try {
      const members = await db.select().from(eventTeamMembers).where(
        and(
          eq(eventTeamMembers.eventId, eventId),
          eq(eventTeamMembers.userId, userId)
        )
      );
      console.log(`Encontrados ${members.length} registros para o usu\xE1rio na equipe`);
      console.log("Registros:", JSON.stringify(members));
      return members.length > 0;
    } catch (error) {
      console.error(`Erro ao verificar se usu\xE1rio ${userId} \xE9 membro da equipe:`, error);
      return false;
    }
  }
  async hasUserAccessToEvent(userId, eventId) {
    return executeWithRetry(async () => {
      console.log(`Verificando acesso do usu\xE1rio ${userId} ao evento ${eventId}`);
      if (!userId || userId === "undefined") {
        console.log("UserId \xE9 undefined ou inv\xE1lido");
        return false;
      }
      const [event] = await db.select().from(events).where(
        and(
          eq(events.id, eventId),
          eq(events.ownerId, userId)
        )
      );
      console.log(`Evento encontrado como propriet\xE1rio:`, event ? "SIM" : "N\xC3O");
      if (event) {
        return true;
      }
      const isTeamMember = await this.isUserTeamMember(userId, eventId);
      console.log(`Usu\xE1rio \xE9 membro da equipe:`, isTeamMember ? "SIM" : "N\xC3O");
      return isTeamMember;
    });
  }
  // Vendor operations
  async getVendorsByEventId(eventId) {
    console.log(`Buscando fornecedores para o evento ${eventId}`);
    try {
      const result = await db.select().from(vendors).where(eq(vendors.eventId, eventId));
      console.log(`Encontrados ${result.length} fornecedores para o evento ${eventId}`);
      console.log("Exemplo de fornecedor encontrado:", result.length > 0 ? result[0] : "Nenhum");
      return result;
    } catch (error) {
      console.error(`Erro ao buscar fornecedores para o evento ${eventId}:`, error);
      return [];
    }
  }
  async getVendorById(id) {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }
  async createVendor(vendorData) {
    const [vendor] = await db.insert(vendors).values(vendorData).returning();
    return vendor;
  }
  async updateVendor(id, vendorData) {
    const [vendor] = await db.update(vendors).set({
      ...vendorData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(vendors.id, id)).returning();
    return vendor;
  }
  async deleteVendor(id) {
    await db.delete(vendors).where(eq(vendors.id, id));
  }
  // Activity log operations
  async getActivityLogsByEventId(eventId) {
    const logs = await db.select().from(activityLogs).where(eq(activityLogs.eventId, eventId)).orderBy(desc(activityLogs.createdAt));
    return logs.map((log) => {
      let parsedDetails = log.details;
      if (typeof parsedDetails === "string") {
        try {
          parsedDetails = JSON.parse(parsedDetails);
        } catch {
          parsedDetails = {};
        }
      }
      return { ...log, details: parsedDetails };
    });
  }
  async createActivityLog(activityLogData) {
    const [activityLog] = await db.insert(activityLogs).values(activityLogData).returning();
    return activityLog;
  }
  // Budget item operations
  async getBudgetItemsByEventId(eventId) {
    return db.select().from(budgetItems).where(eq(budgetItems.eventId, eventId)).orderBy(desc(budgetItems.createdAt));
  }
  async getBudgetItemById(id) {
    const [item] = await db.select().from(budgetItems).where(eq(budgetItems.id, id)).limit(1);
    return item;
  }
  async createBudgetItem(budgetItemData) {
    const [item] = await db.insert(budgetItems).values(budgetItemData).returning();
    return item;
  }
  async updateBudgetItem(id, budgetItemData) {
    const [item] = await db.update(budgetItems).set({
      ...budgetItemData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(budgetItems.id, id)).returning();
    return item;
  }
  async deleteBudgetItem(id) {
    await db.delete(budgetItems).where(eq(budgetItems.id, id));
  }
  // Expense operations
  async getExpensesByEventId(eventId) {
    return db.select().from(expenses).where(eq(expenses.eventId, eventId)).orderBy(desc(expenses.createdAt));
  }
  async getExpenseById(id) {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    return expense;
  }
  async createExpense(expenseData) {
    const [expense] = await db.insert(expenses).values(expenseData).returning();
    const event = await this.getEventById(expenseData.eventId);
    if (event) {
      const totalExpenses = await this.calculateEventTotalExpenses(expenseData.eventId);
      await this.updateEvent(expenseData.eventId, { expenses: totalExpenses });
    }
    return expense;
  }
  async updateExpense(id, expenseData) {
    const [expense] = await db.update(expenses).set({
      ...expenseData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(expenses.id, id)).returning();
    if (expenseData.amount !== void 0 || expenseData.eventId !== void 0) {
      const eventId = expenseData.eventId !== void 0 ? expenseData.eventId : expense.eventId;
      const totalExpenses = await this.calculateEventTotalExpenses(eventId);
      await this.updateEvent(eventId, { expenses: totalExpenses });
    }
    return expense;
  }
  async deleteExpense(id) {
    const expense = await this.getExpenseById(id);
    if (expense) {
      await db.delete(expenses).where(eq(expenses.id, id));
      const totalExpenses = await this.calculateEventTotalExpenses(expense.eventId);
      await this.updateEvent(expense.eventId, { expenses: totalExpenses });
    }
  }
  // Método auxiliar para calcular o total de despesas de um evento
  async calculateEventTotalExpenses(eventId) {
    const allExpenses = await db.select({ total: sql`SUM(${expenses.amount})` }).from(expenses).where(eq(expenses.eventId, eventId));
    return Number(allExpenses[0]?.total || 0);
  }
  // Task assignee operations
  async getTaskAssignees(taskId) {
    return executeWithRetry(async () => {
      const assignees = await db.select().from(taskAssignees).where(eq(taskAssignees.taskId, taskId));
      return Promise.all(
        assignees.map(async (assignee) => {
          const [user] = await db.select().from(users).where(eq(users.id, assignee.userId));
          return {
            ...assignee,
            user
          };
        })
      );
    });
  }
  async addTaskAssignee(taskId, userId) {
    return executeWithRetry(async () => {
      const existingAssignees = await db.select().from(taskAssignees).where(
        and(
          eq(taskAssignees.taskId, taskId),
          eq(taskAssignees.userId, userId)
        )
      );
      if (existingAssignees.length > 0) {
        return existingAssignees[0];
      }
      const [assignee] = await db.insert(taskAssignees).values({
        taskId,
        userId
      }).returning();
      const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
      if (task && task.eventId) {
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
      return assignee;
    });
  }
  async removeTaskAssignee(taskId, userId) {
    return executeWithRetry(async () => {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
      await db.delete(taskAssignees).where(
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
  async replaceTaskAssignees(taskId, userIds) {
    return executeWithRetry(async () => {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
      await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));
      if (!userIds || userIds.length === 0) {
        return [];
      }
      const assignees = await Promise.all(
        userIds.map(async (userId) => {
          const [assignee] = await db.insert(taskAssignees).values({
            taskId,
            userId
          }).returning();
          return assignee;
        })
      );
      if (task && task.eventId) {
        taskCache.invalidate(`tasks:event:${task.eventId}`);
      }
      return assignees;
    });
  }
  // Document operations
  async getDocumentsByEventId(eventId) {
    const cacheKey = `documents:event:${eventId}`;
    const cachedDocuments = documentCache.get(cacheKey);
    if (cachedDocuments) return cachedDocuments;
    return executeWithRetry(async () => {
      const result = await db.select().from(documents).where(eq(documents.eventId, eventId)).orderBy(desc(documents.uploadedAt));
      documentCache.set(cacheKey, result);
      return result;
    });
  }
  async getDocumentById(id) {
    const cacheKey = `document:${id}`;
    const cachedDocument = documentCache.get(cacheKey);
    if (cachedDocument) return cachedDocument;
    return executeWithRetry(async () => {
      const [document] = await db.select().from(documents).where(eq(documents.id, id));
      if (document) {
        documentCache.set(cacheKey, document);
      }
      return document;
    });
  }
  async getDocumentsByCategory(eventId, category) {
    const cacheKey = `documents:event:${eventId}:category:${category}`;
    const cachedDocuments = documentCache.get(cacheKey);
    if (cachedDocuments) return cachedDocuments;
    return executeWithRetry(async () => {
      const result = await db.select().from(documents).where(and(
        eq(documents.eventId, eventId),
        eq(documents.category, category)
      )).orderBy(desc(documents.uploadedAt));
      documentCache.set(cacheKey, result);
      return result;
    });
  }
  async createDocument(documentData) {
    return executeWithRetry(async () => {
      const [document] = await db.insert(documents).values(documentData).returning();
      documentCache.invalidate(`documents:event:${documentData.eventId}`);
      documentCache.invalidate(`documents:event:${documentData.eventId}:category:${documentData.category}`);
      documentCache.set(`document:${document.id}`, document);
      return document;
    });
  }
  async updateDocument(id, documentData) {
    return executeWithRetry(async () => {
      const [document] = await db.update(documents).set({
        ...documentData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(documents.id, id)).returning();
      documentCache.invalidate(`documents:event:${document.eventId}`);
      documentCache.invalidate(`documents:event:${document.eventId}:category:${document.category}`);
      documentCache.set(`document:${document.id}`, document);
      return document;
    });
  }
  async deleteDocument(id) {
    return executeWithRetry(async () => {
      const document = await this.getDocumentById(id);
      if (document) {
        await db.delete(documents).where(eq(documents.id, id));
        documentCache.invalidate(`documents:event:${document.eventId}`);
        documentCache.invalidate(`documents:event:${document.eventId}:category:${document.category}`);
        documentCache.invalidate(`document:${id}`);
      }
    });
  }
  // Participant operations
  async getParticipantsByEventId(eventId) {
    const cacheKey = `participants:event:${eventId}`;
    const cachedParticipants = participantCache.get(cacheKey);
    if (cachedParticipants) return cachedParticipants;
    return executeWithRetry(async () => {
      const result = await db.select().from(participants).where(eq(participants.eventId, eventId)).orderBy(participants.name);
      participantCache.set(cacheKey, result);
      return result;
    });
  }
  async getParticipantById(id) {
    const cacheKey = `participant:${id}`;
    const cachedParticipant = participantCache.get(cacheKey);
    if (cachedParticipant) return cachedParticipant;
    return executeWithRetry(async () => {
      const [participant] = await db.select().from(participants).where(eq(participants.id, id));
      if (participant) {
        participantCache.set(cacheKey, participant);
      }
      return participant;
    });
  }
  async createParticipant(participantData) {
    return executeWithRetry(async () => {
      const [participant] = await db.insert(participants).values(participantData).returning();
      participantCache.invalidate(`participants:event:${participantData.eventId}`);
      participantCache.set(`participant:${participant.id}`, participant);
      return participant;
    });
  }
  async createParticipants(participantsData) {
    return executeWithRetry(async () => {
      const createdParticipants = await db.insert(participants).values(participantsData).returning();
      const eventIds = Array.from(new Set(participantsData.map((p) => p.eventId)));
      eventIds.forEach((eventId) => {
        participantCache.invalidate(`participants:event:${eventId}`);
      });
      createdParticipants.forEach((participant) => {
        participantCache.set(`participant:${participant.id}`, participant);
      });
      return createdParticipants;
    });
  }
  async updateParticipant(id, participantData) {
    return executeWithRetry(async () => {
      const [participant] = await db.update(participants).set({
        ...participantData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(participants.id, id)).returning();
      participantCache.invalidate(`participants:event:${participant.eventId}`);
      participantCache.set(`participant:${participant.id}`, participant);
      return participant;
    });
  }
  async deleteParticipant(id) {
    return executeWithRetry(async () => {
      const participant = await this.getParticipantById(id);
      if (participant) {
        await db.delete(participants).where(eq(participants.id, id));
        participantCache.invalidate(`participants:event:${participant.eventId}`);
        participantCache.invalidate(`participant:${id}`);
      }
    });
  }
  async getParticipantStats(eventId) {
    return executeWithRetry(async () => {
      const eventParticipants = await this.getParticipantsByEventId(eventId);
      const total = eventParticipants.length;
      const confirmed = eventParticipants.filter((p) => p.status === "confirmed").length;
      const pending = eventParticipants.filter((p) => p.status === "pending").length;
      return { total, confirmed, pending };
    });
  }
  // Feedback operations
  async getFeedbacksByEventId(eventId) {
    return executeWithRetry(async () => {
      const feedbacks = await db.select().from(eventFeedbacks).where(eq(eventFeedbacks.eventId, eventId)).orderBy(desc(eventFeedbacks.createdAt));
      return feedbacks;
    });
  }
  async getFeedbackByFeedbackId(feedbackId) {
    return executeWithRetry(async () => {
      const [result] = await db.select({
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
      }).from(eventFeedbacks).innerJoin(events, eq(eventFeedbacks.eventId, events.id)).where(eq(eventFeedbacks.feedbackId, feedbackId));
      return result;
    });
  }
  async createFeedback(feedbackData) {
    return executeWithRetry(async () => {
      const [feedback] = await db.insert(eventFeedbacks).values(feedbackData).returning();
      return feedback;
    });
  }
  async deleteFeedback(id) {
    return executeWithRetry(async () => {
      await db.delete(eventFeedbacks).where(eq(eventFeedbacks.id, id));
    });
  }
  async generateFeedbackLink(eventId) {
    return executeWithRetry(async () => {
      const feedbackId = `feedback_${eventId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const existingFeedback = await db.select().from(eventFeedbacks).where(and(eq(eventFeedbacks.eventId, eventId), isNotNull(eventFeedbacks.feedbackId))).limit(1);
      if (existingFeedback.length > 0) {
        return existingFeedback[0].feedbackId;
      }
      return feedbackId;
    });
  }
  async getFeedbackStats(eventId) {
    return executeWithRetry(async () => {
      const feedbacks = await db.select().from(eventFeedbacks).where(and(eq(eventFeedbacks.eventId, eventId), sql`${eventFeedbacks.rating} > 0`));
      const total = feedbacks.length;
      if (total === 0) {
        return { total: 0, averageRating: 0, anonymousPercentage: 0 };
      }
      const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = totalRating / total;
      const anonymousCount = feedbacks.filter((feedback) => feedback.isAnonymous).length;
      const anonymousPercentage = anonymousCount / total * 100;
      return {
        total,
        averageRating: Math.round(averageRating * 10) / 10,
        anonymousPercentage: Math.round(anonymousPercentage)
      };
    });
  }
  async createFeedbackMetric(metric) {
    return executeWithRetry(async () => {
      const [result] = await db.insert(feedbackMetrics).values(metric).returning();
      return result;
    });
  }
  async updateFeedbackMetricSubmission(feedbackId, ipAddress, userAgent) {
    return executeWithRetry(async () => {
      await db.update(feedbackMetrics).set({
        submittedAt: /* @__PURE__ */ new Date(),
        ipAddress,
        userAgent
      }).where(eq(feedbackMetrics.feedbackId, feedbackId));
    });
  }
  async getEventByFeedbackId(feedbackId) {
    return executeWithRetry(async () => {
      const [result] = await db.select({
        event: events
      }).from(eventFeedbacks).innerJoin(events, eq(eventFeedbacks.eventId, events.id)).where(eq(eventFeedbacks.feedbackId, feedbackId));
      return result?.event;
    });
  }
  async getEventFeedbackByFeedbackId(feedbackId) {
    return executeWithRetry(async () => {
      const [result] = await db.select({
        eventId: eventFeedbacks.eventId,
        feedbackId: eventFeedbacks.feedbackId
      }).from(eventFeedbacks).where(eq(eventFeedbacks.feedbackId, feedbackId));
      return result;
    });
  }
  async getEventFeedbacks(eventId) {
    return executeWithRetry(async () => {
      const results = await db.select().from(eventFeedbacks).where(and(
        eq(eventFeedbacks.eventId, eventId),
        sql`${eventFeedbacks.rating} > 0`
      )).orderBy(desc(eventFeedbacks.createdAt));
      console.log(`[DEBUG] Encontrados ${results.length} feedbacks v\xE1lidos para evento ${eventId}`);
      return results;
    });
  }
  async getExistingFeedbackLink(eventId) {
    return executeWithRetry(async () => {
      const [event] = await db.select({ feedbackUrl: events.feedbackUrl }).from(events).where(eq(events.id, eventId));
      return event?.feedbackUrl || null;
    });
  }
  async getDraftEventByUser(userId) {
    return executeWithRetry(async () => {
      const [draft] = await db.select().from(events).where(and(
        eq(events.ownerId, userId),
        eq(events.status, "draft")
      )).orderBy(desc(events.updatedAt)).limit(1);
      return draft;
    });
  }
  async saveDraftEvent(userId, draftData) {
    return executeWithRetry(async () => {
      const existingDraft = await this.getDraftEventByUser(userId);
      if (existingDraft) {
        const [updated] = await db.update(events).set({
          ...draftData,
          status: "draft",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(events.id, existingDraft.id)).returning();
        eventCache.invalidate(`event:${existingDraft.id}`);
        return updated;
      } else {
        const [created] = await db.insert(events).values({
          name: draftData.name || "Rascunho",
          type: draftData.type || "other",
          format: draftData.format || "in_person",
          startDate: draftData.startDate || /* @__PURE__ */ new Date(),
          endDate: draftData.endDate,
          startTime: draftData.startTime,
          endTime: draftData.endTime,
          location: draftData.location,
          meetingUrl: draftData.meetingUrl,
          description: draftData.description,
          budget: draftData.budget,
          attendees: draftData.attendees,
          coverImageUrl: draftData.coverImageUrl,
          status: "draft",
          ownerId: userId,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return created;
      }
    });
  }
  async deleteDraftEvent(userId) {
    return executeWithRetry(async () => {
      const draft = await this.getDraftEventByUser(userId);
      if (draft) {
        await db.delete(events).where(eq(events.id, draft.id));
        eventCache.invalidate(`event:${draft.id}`);
      }
    });
  }
};
var storage = new DatabaseStorage();

// server/utils/imageUpload.ts
import fs from "fs";
import path from "path";
function saveBase64Image(base64Data, eventId) {
  try {
    const matches = base64Data.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid base64 image format");
    }
    const imageType = matches[1];
    const imageBuffer = Buffer.from(matches[2], "base64");
    const uploadDir2 = path.join(process.cwd(), "public", "uploads", "events");
    if (!fs.existsSync(uploadDir2)) {
      fs.mkdirSync(uploadDir2, { recursive: true });
    }
    const fileName = `event-${eventId}-${Date.now()}.${imageType}`;
    const filePath = path.join(uploadDir2, fileName);
    fs.writeFileSync(filePath, imageBuffer);
    return `/uploads/events/${fileName}`;
  } catch (error) {
    console.error("Erro ao salvar imagem:", error);
    throw new Error("Falha ao processar upload da imagem");
  }
}
function deleteImage(imageUrl) {
  try {
    if (imageUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
  }
}

// server/routes.ts
init_schema();
import { eq as eq3 } from "drizzle-orm";

// server/supabaseAuth.ts
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
import memorystore from "memorystore";
var emailToUserIdCache = /* @__PURE__ */ new Map();
var CACHE_TTL = 5 * 60 * 1e3;
async function getEffectiveUserId(email, supabaseUserId) {
  const cached = emailToUserIdCache.get(email);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.userId;
  }
  const dbStorage = await storage;
  const existingUser = await dbStorage.getUserByEmail(email);
  if (existingUser) {
    emailToUserIdCache.set(email, { userId: existingUser.id, timestamp: Date.now() });
    return existingUser.id;
  }
  emailToUserIdCache.set(email, { userId: supabaseUserId, timestamp: Date.now() });
  return supabaseUserId;
}
function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1e3;
  const MemoryStore = memorystore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 864e5
  });
  return session({
    secret: process.env.SESSION_SECRET || "supabase-session-secret-dev",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: sessionTtl
    }
  });
}
async function setupSupabaseAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.get("/api/supabase-config", (req, res) => {
    res.json({
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY
    });
  });
  app2.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error("Erro ao destruir sess\xE3o:", err);
      res.redirect("/auth");
    });
  });
}
var DEV_TOKEN_PREFIX = "dev-token-";
var isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[Auth] Token n\xE3o fornecido no header Authorization");
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
  const token = authHeader.substring(7);
  if (token.startsWith(DEV_TOKEN_PREFIX)) {
    if (process.env.NODE_ENV === "production") {
      console.log("[Auth] Token de desenvolvimento rejeitado em produ\xE7\xE3o");
      return res.status(401).json({ message: "Unauthorized - Dev tokens not allowed in production" });
    }
    try {
      const payloadBase64 = token.substring(DEV_TOKEN_PREFIX.length);
      const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
      if (!payload.is_dev) {
        return res.status(401).json({ message: "Unauthorized - Invalid dev token" });
      }
      console.log("[Auth] \u{1F527} Token de DESENVOLVIMENTO aceito - UserId:", payload.sub);
      req.user = {
        claims: {
          sub: payload.sub,
          supabaseId: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: null
        }
      };
      return next();
    } catch (error) {
      console.log("[Auth] Token de desenvolvimento inv\xE1lido");
      return res.status(401).json({ message: "Unauthorized - Invalid dev token format" });
    }
  }
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("[Auth] Token JWT inv\xE1lido - formato incorreto");
      return res.status(401).json({ message: "Unauthorized - Invalid token format" });
    }
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp && payload.exp < now) {
      console.log("[Auth] Token expirado");
      return res.status(401).json({ message: "Unauthorized - Token expired" });
    }
    const supabaseUserId = payload.sub;
    const email = payload.email;
    const userMetadata = payload.user_metadata || {};
    if (!supabaseUserId) {
      console.log("[Auth] Token n\xE3o cont\xE9m user ID");
      return res.status(401).json({ message: "Unauthorized - No user ID in token" });
    }
    if (!email) {
      console.log("[Auth] Token n\xE3o cont\xE9m email");
      return res.status(401).json({ message: "Unauthorized - No email in token" });
    }
    const effectiveUserId = await getEffectiveUserId(email, supabaseUserId);
    console.log("[Auth] Resolu\xE7\xE3o de ID - Supabase UUID:", supabaseUserId, "-> ID efetivo:", effectiveUserId, "Email:", email);
    req.user = {
      claims: {
        sub: effectiveUserId,
        // Usar o ID efetivo (original do banco ou UUID)
        supabaseId: supabaseUserId,
        // Manter o UUID original caso precise
        email,
        name: userMetadata.full_name || userMetadata.name || email?.split("@")[0],
        picture: userMetadata.avatar_url || userMetadata.picture
      }
    };
    return next();
  } catch (error) {
    console.error("[Auth] Erro ao verificar token:", error.message);
    return res.status(401).json({ message: "Unauthorized - Token verification failed" });
  }
};

// server/routes.ts
init_schema();
import csvParser from "csv-parser";
import * as XLSX from "xlsx";
import { z as z3 } from "zod";

// server/openai.ts
import OpenAI from "openai";
var openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;
async function generateEventChecklist(eventData) {
  try {
    const eventStartDate = new Date(eventData.startDate);
    const today = /* @__PURE__ */ new Date();
    const daysUntilEvent = Math.ceil((eventStartDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    console.log("Gerando checklist universal para evento:", eventData.name);
    console.log("Tipo de evento:", eventData.type);
    console.log("Dias at\xE9 o evento:", daysUntilEvent);
    const checklist = [];
    const isLargeEvent = (eventData.attendees || 0) >= 100;
    const hasHighBudget = (eventData.budget || 0) >= 2e4;
    const hasLocation = !!eventData.location;
    const isWorkshop = eventData.name?.toLowerCase().includes("workshop") || eventData.description?.toLowerCase().includes("workshop") || eventData.description?.toLowerCase().includes("intensivo") || eventData.description?.toLowerCase().includes("aprenda") || eventData.description?.toLowerCase().includes("curso") || eventData.description?.toLowerCase().includes("treinamento");
    const isFashionEvent = eventData.name?.toLowerCase().includes("cole\xE7\xE3o") || eventData.name?.toLowerCase().includes("moda") || eventData.name?.toLowerCase().includes("desfile");
    checklist.push({
      title: "Definir objetivos e prop\xF3sito do evento",
      dueDateBefore: Math.min(daysUntilEvent - 3, 45),
      description: "Estabelecer metas claras, p\xFAblico-alvo e resultados esperados",
      priority: "high"
    });
    if (!hasLocation) {
      checklist.push({
        title: "Pesquisar e reservar local",
        dueDateBefore: Math.min(daysUntilEvent - 10, 30),
        description: `Encontrar espa\xE7o adequado para ${eventData.attendees || "todos"} participantes`,
        priority: "high"
      });
    } else {
      checklist.push({
        title: "Confirmar reserva e preparar espa\xE7o",
        dueDateBefore: Math.min(daysUntilEvent - 5, 20),
        description: `Finalizar detalhes com ${eventData.location} e planejar layout`,
        priority: "high"
      });
    }
    if (isWorkshop) {
      checklist.push({
        title: "Preparar conte\xFAdo e material did\xE1tico",
        dueDateBefore: Math.min(daysUntilEvent - 5, 25),
        description: "Desenvolver apostilas, apresenta\xE7\xF5es e exerc\xEDcios pr\xE1ticos",
        priority: "high"
      });
      checklist.push({
        title: "Testar equipamentos e materiais",
        dueDateBefore: Math.min(daysUntilEvent - 2, 7),
        description: "Verificar som, proje\xE7\xE3o e materiais necess\xE1rios",
        priority: "high"
      });
    }
    if (isFashionEvent) {
      checklist.push({
        title: "Definir conceito e tema",
        dueDateBefore: Math.min(daysUntilEvent - 10, 30),
        description: "Finalizar conceito, paleta de cores e tema geral",
        priority: "high"
      });
      checklist.push({
        title: "Contratar modelos e equipe de produ\xE7\xE3o",
        dueDateBefore: Math.min(daysUntilEvent - 8, 25),
        description: "Selecionar modelos, fot\xF3grafos e equipe t\xE9cnica",
        priority: "high"
      });
    }
    checklist.push({
      title: "Criar lista de participantes",
      dueDateBefore: Math.min(daysUntilEvent - 7, 25),
      description: `Desenvolver lista completa para ${eventData.attendees || ""} pessoas`,
      priority: "high"
    });
    checklist.push({
      title: "Criar e enviar convites",
      dueDateBefore: Math.min(daysUntilEvent - 5, 20),
      description: "Desenvolver convites e sistema de confirma\xE7\xE3o",
      priority: "high"
    });
    checklist.push({
      title: "Criar estrat\xE9gia de divulga\xE7\xE3o",
      dueDateBefore: Math.min(daysUntilEvent - 10, 15),
      description: "Planejar marketing digital e redes sociais",
      priority: "medium"
    });
    if (eventData.budget && eventData.budget > 1e3) {
      checklist.push({
        title: "Organizar alimenta\xE7\xE3o e bebidas",
        dueDateBefore: Math.min(daysUntilEvent - 5, 15),
        description: "Contratar catering ou organizar coffee break",
        priority: "medium"
      });
    }
    checklist.push({
      title: "Contratar servi\xE7os audiovisuais",
      dueDateBefore: Math.min(daysUntilEvent - 8, 20),
      description: "Garantir som, ilumina\xE7\xE3o e equipamentos necess\xE1rios",
      priority: hasHighBudget || isLargeEvent ? "high" : "medium"
    });
    if (isLargeEvent) {
      checklist.push({
        title: "Organizar equipe de apoio",
        dueDateBefore: Math.min(daysUntilEvent - 5, 15),
        description: "Definir recep\xE7\xE3o, controle de acesso e suporte",
        priority: "medium"
      });
      checklist.push({
        title: "Sistema de credenciamento",
        dueDateBefore: Math.min(daysUntilEvent - 3, 10),
        description: "Configurar processo de entrada e identifica\xE7\xE3o",
        priority: "medium"
      });
    }
    checklist.push({
      title: "Confirmar presen\xE7a dos participantes",
      dueDateBefore: Math.min(daysUntilEvent - 2, 5),
      description: "Fazer follow-up final e organizar lista de confirmados",
      priority: "medium"
    });
    checklist.push({
      title: "Preparar materiais do evento",
      dueDateBefore: 1,
      description: "Organizar crach\xE1s, kits e materiais de distribui\xE7\xE3o",
      priority: "high"
    });
    checklist.push({
      title: "Revisar log\xEDstica final",
      dueDateBefore: 1,
      description: "Verificar todos os detalhes e preparativos finais",
      priority: "high"
    });
    checklist.push({
      title: "Coletar feedback dos participantes",
      dueDateBefore: -2,
      // 2 dias após o evento
      description: "Enviar formul\xE1rio de avalia\xE7\xE3o e coletar sugest\xF5es",
      priority: "medium"
    });
    const formattedChecklist = checklist.map((item) => {
      let dueDate;
      if (item.dueDateBefore > 0) {
        dueDate = new Date(eventStartDate);
        dueDate.setDate(dueDate.getDate() - item.dueDateBefore);
      } else if (item.dueDateBefore < 0) {
        dueDate = new Date(eventStartDate);
        dueDate.setDate(dueDate.getDate() + Math.abs(item.dueDateBefore));
      } else {
        dueDate = new Date(eventStartDate);
      }
      return {
        title: item.title,
        description: item.description,
        dueDate,
        priority: item.priority
      };
    });
    console.log(`Checklist gerado com ${formattedChecklist.length} tarefas`);
    return formattedChecklist;
  } catch (error) {
    console.error("Erro ao gerar checklist:", error);
    return [];
  }
}

// server/scheduleRoutes.ts
import { Router } from "express";
import { z as z2 } from "zod";
init_schema();
import { eq as eq2 } from "drizzle-orm";
var router = Router();
router.get("/events/:eventId/schedule", async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inv\xE1lido" });
    }
    const items = await db.select().from(scheduleItems).where(eq2(scheduleItems.eventId, eventId)).orderBy(scheduleItems.startTime);
    res.json(items);
  } catch (error) {
    console.error("Erro ao buscar itens do cronograma:", error);
    res.status(500).json({ message: "Erro ao buscar itens do cronograma" });
  }
});
router.get("/schedule/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de item inv\xE1lido" });
    }
    const item = await db.select().from(scheduleItems).where(eq2(scheduleItems.id, id));
    if (item.length === 0) {
      return res.status(404).json({ message: "Item do cronograma n\xE3o encontrado" });
    }
    res.json(item[0]);
  } catch (error) {
    console.error("Erro ao buscar item do cronograma:", error);
    res.status(500).json({ message: "Erro ao buscar item do cronograma" });
  }
});
router.post("/events/:eventId/schedule", async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inv\xE1lido" });
    }
    const validatedData = insertScheduleItemSchema.parse({
      ...req.body,
      eventId
    });
    const newItem = await db.insert(scheduleItems).values(validatedData).returning();
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error("Erro ao criar item do cronograma:", error);
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        message: "Dados inv\xE1lidos para o item do cronograma",
        errors: error.errors
      });
    }
    res.status(500).json({ message: "Erro ao criar item do cronograma" });
  }
});
router.put("/schedule/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de item inv\xE1lido" });
    }
    const validatedData = insertScheduleItemSchema.partial().parse(req.body);
    const updatedItem = await db.update(scheduleItems).set({
      ...validatedData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(scheduleItems.id, id)).returning();
    if (updatedItem.length === 0) {
      return res.status(404).json({ message: "Item do cronograma n\xE3o encontrado" });
    }
    res.json(updatedItem[0]);
  } catch (error) {
    console.error("Erro ao atualizar item do cronograma:", error);
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        message: "Dados inv\xE1lidos para o item do cronograma",
        errors: error.errors
      });
    }
    res.status(500).json({ message: "Erro ao atualizar item do cronograma" });
  }
});
router.delete("/schedule/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de item inv\xE1lido" });
    }
    const deletedItem = await db.delete(scheduleItems).where(eq2(scheduleItems.id, id)).returning();
    if (deletedItem.length === 0) {
      return res.status(404).json({ message: "Item do cronograma n\xE3o encontrado" });
    }
    res.json({ success: true, message: "Item do cronograma exclu\xEDdo com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir item do cronograma:", error);
    res.status(500).json({ message: "Erro ao excluir item do cronograma" });
  }
});
var scheduleRoutes_default = router;

// server/cronogramaRoutes.ts
import { Router as Router2 } from "express";
var debugMiddleware = (req, res, next) => {
  console.log(`[DEBUG CRONOGRAMA] Acessando rota: ${req.method} ${req.originalUrl}`);
  console.log(`[DEBUG CRONOGRAMA] Usu\xE1rio autenticado: ${req.user ? req.user.claims.sub : "N\xE3o autenticado"}`);
  next();
};
var router2 = Router2();
router2.get("/events/:eventId/schedule", debugMiddleware, isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inv\xE1lido" });
    }
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este evento" });
    }
    const result = await db.execute(`
      SELECT id, event_id, title, description, start_time, location, responsibles, 
             created_at, updated_at
      FROM schedule_items 
      WHERE event_id = ${eventId} 
      ORDER BY start_time
    `);
    const formattedItems = result.rows.map((item) => ({
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
router2.post("/events/:eventId/schedule", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const eventId = parseInt(req.params.eventId, 10);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "ID de evento inv\xE1lido" });
    }
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este evento" });
    }
    const { title, description, startTime, location, responsibles } = req.body;
    if (!title || !startTime) {
      return res.status(400).json({
        message: "T\xEDtulo e hor\xE1rio de in\xEDcio s\xE3o obrigat\xF3rios"
      });
    }
    const descVal = description || null;
    const locVal = location || null;
    const respVal = responsibles || null;
    const result = await db.execute(`
      INSERT INTO schedule_items 
        (event_id, title, description, start_time, location, responsibles, created_at, updated_at) 
      VALUES 
        (${eventId}, '${String(title).replace(/'/g, "''")}', ${descVal ? `'${String(descVal).replace(/'/g, "''")}'` : "NULL"}, '${String(startTime).replace(/'/g, "''")}', ${locVal ? `'${String(locVal).replace(/'/g, "''")}'` : "NULL"}, ${respVal ? `'${String(respVal).replace(/'/g, "''")}'` : "NULL"}, NOW(), NOW())
      RETURNING id, event_id, title, description, start_time, location, responsibles, 
                created_at, updated_at
    `);
    const newItem = result.rows[0];
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
router2.put("/schedule/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de item inv\xE1lido" });
    }
    const itemResult = await db.execute(`
      SELECT event_id FROM schedule_items WHERE id = ${id}
    `);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: "Item n\xE3o encontrado" });
    }
    const eventId = itemResult.rows[0].event_id;
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este item" });
    }
    const { title, description, startTime, location, responsibles } = req.body;
    if (!title || !startTime) {
      return res.status(400).json({
        message: "T\xEDtulo e hor\xE1rio de in\xEDcio s\xE3o obrigat\xF3rios"
      });
    }
    const descVal = description || null;
    const locVal = location || null;
    const respVal = responsibles || null;
    const result = await db.execute(`
      UPDATE schedule_items 
      SET 
        title = '${String(title).replace(/'/g, "''")}', 
        description = ${descVal ? `'${String(descVal).replace(/'/g, "''")}'` : "NULL"}, 
        start_time = '${String(startTime).replace(/'/g, "''")}', 
        location = ${locVal ? `'${String(locVal).replace(/'/g, "''")}'` : "NULL"}, 
        responsibles = ${respVal ? `'${String(respVal).replace(/'/g, "''")}'` : "NULL"}, 
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, event_id, title, description, start_time, location, responsibles, 
                created_at, updated_at
    `);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Falha ao atualizar o item" });
    }
    const updatedItem = result.rows[0];
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
router2.delete("/schedule/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de item inv\xE1lido" });
    }
    const itemResult = await db.execute(`
      SELECT event_id FROM schedule_items WHERE id = ${id}
    `);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: "Item n\xE3o encontrado" });
    }
    const eventId = itemResult.rows[0].event_id;
    const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
    if (!hasAccess) {
      return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este item" });
    }
    await db.execute(`
      DELETE FROM schedule_items WHERE id = ${id}
    `);
    res.json({ success: true, message: "Item exclu\xEDdo com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir item do cronograma:", error);
    res.status(500).json({ message: "Falha ao excluir item do cronograma" });
  }
});
var cronogramaRoutes_default = router2;

// server/cronogramaDirectRoute.ts
function setupCronogramaRoute(app2) {
  app2.get("/api/events/:eventId/cronograma", async (req, res) => {
    try {
      console.log("Iniciando requisi\xE7\xE3o para o cronograma direto");
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      console.log("Executando consulta para o evento ID:", eventId);
      const query = `
        SELECT id, event_id, title, description, start_time, location, responsibles, 
               created_at, updated_at
        FROM schedule_items 
        WHERE event_id = ${eventId} 
        ORDER BY start_time
      `;
      console.log("Query:", query);
      const result = await db.execute(query);
      console.log(`Itens encontrados no cronograma: ${result.rows.length}`);
      const formattedItems = result.rows.map((item) => ({
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

// server/routes.ts
var debugLog = (msg) => {
  try {
    fs2.appendFileSync(path2.join(process.cwd(), "debug.log"), `[${(/* @__PURE__ */ new Date()).toISOString()}] ${msg}
`);
  } catch (e) {
  }
};
var isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
var isValidPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};
var uploadDir = path2.join(process.cwd(), "public", "uploads");
try {
  if (!fs2.existsSync(uploadDir)) {
    fs2.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.log("Skipping upload directory creation (serverless environment)");
}
var multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp2 = Date.now();
    const originalName = file.originalname;
    const extension = path2.extname(originalName);
    const nameWithoutExt = path2.basename(originalName, extension);
    cb(null, `doc-${timestamp2}-${nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_")}${extension}`);
  }
});
var upload = multer({
  storage: multerStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  // 50MB limit for documents
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|mp4|mov|avi|mp3|wav/;
    const extname = allowedTypes.test(path2.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo n\xE3o permitido"));
    }
  }
});
async function registerRoutes(app2) {
  app2.use("/uploads", express.static(uploadDir));
  await setupSupabaseAuth(app2);
  const { devModeAuth: devModeAuth2 } = await Promise.resolve().then(() => (init_devMode(), devMode_exports));
  app2.use(devModeAuth2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const supabaseUserId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      const userName = req.user.claims.name;
      const userPicture = req.user.claims.picture;
      console.log("[Auth] Login via Supabase - UUID:", supabaseUserId, "Email:", userEmail);
      debugLog(`AUTH_USER: sub=${supabaseUserId}, email=${userEmail}`);
      if (!userEmail) {
        console.error("[Auth] Email n\xE3o fornecido pelo Supabase!");
        return res.status(400).json({ message: "Email is required" });
      }
      const existingUser = await storage.getUserByEmail(userEmail);
      if (existingUser) {
        console.log("[Auth] Usu\xE1rio existente encontrado! Usando ID original:", existingUser.id);
        debugLog(`AUTH_USER: existing user found id=${existingUser.id}, returning this`);
        if (userPicture && existingUser.profileImageUrl !== userPicture) {
          await storage.upsertUser({
            ...existingUser,
            profileImageUrl: userPicture
          });
          existingUser.profileImageUrl = userPicture;
        }
        return res.json(existingUser);
      }
      const existingUserById = await storage.getUser(supabaseUserId);
      if (existingUserById) {
        console.log("[Auth] Usu\xE1rio encontrado pelo ID:", existingUserById.id, "Email no banco:", existingUserById.email);
        if (userPicture && existingUserById.profileImageUrl !== userPicture) {
          await storage.upsertUser({
            ...existingUserById,
            profileImageUrl: userPicture
          });
          existingUserById.profileImageUrl = userPicture;
        }
        return res.json(existingUserById);
      }
      console.log("[Auth] Usu\xE1rio novo! Criando com UUID do Supabase:", supabaseUserId);
      const userData = {
        id: supabaseUserId,
        email: userEmail,
        firstName: userName?.split(" ")[0] || userEmail.split("@")[0] || "Usu\xE1rio",
        lastName: userName?.split(" ").slice(1).join(" ") || ""
      };
      if (userPicture) {
        userData.profileImageUrl = userPicture;
      }
      const newUser = await storage.upsertUser(userData);
      console.log("[Auth] Novo usu\xE1rio criado:", newUser.id);
      return res.json(newUser);
    } catch (error) {
      console.error("[Auth] Erro detalhado:", error.message);
      console.error("[Auth] Stack:", error.stack);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
  app2.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      console.log("========================================");
      console.log("Buscando eventos para userId:", userId, "email:", userEmail);
      debugLog(`EVENTS: req.user.claims.sub=${userId}, email=${userEmail}`);
      console.log("Claims completos:", JSON.stringify(req.user.claims));
      console.log("========================================");
      if (userEmail) {
        const oldUser = await storage.getUserByEmail(userEmail);
        console.log("Usu\xE1rio encontrado por email:", oldUser?.id, "vs userId atual:", userId);
        if (oldUser && oldUser.id !== userId) {
          console.log("IDs diferentes! Migrando dados de", oldUser.id, "para", userId);
          try {
            await storage.migrateUserFromLocalToReplit(oldUser.id, userId);
            console.log("Migra\xE7\xE3o conclu\xEDda com sucesso!");
          } catch (migrationError) {
            console.error("Erro na migra\xE7\xE3o:", migrationError.message);
          }
        }
      }
      let events2 = await storage.getEventsByUser(userId);
      console.log("Eventos encontrados para userId", userId, ":", events2.length);
      debugLog(`EVENTS: found ${events2.length} events for userId=${userId}`);
      if (events2.length === 0 && userEmail) {
        console.log("Nenhum evento encontrado, tentando fallback por email");
        const oldUser = await storage.getUserByEmail(userEmail);
        if (oldUser && oldUser.id !== userId) {
          console.log("Buscando eventos do usu\xE1rio antigo:", oldUser.id);
          events2 = await storage.getEventsByUser(oldUser.id);
          console.log("Eventos encontrados pelo ID antigo:", events2.length);
        }
      }
      for (const event of events2) {
        const eventVendors = await storage.getVendorsByEventId(event.id);
        event.vendorCount = eventVendors.length;
      }
      res.json(events2);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app2.get("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Usando ID de autentica\xE7\xE3o Replit para acessar evento:", req.params.id);
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        console.log("ID de evento inv\xE1lido:", req.params.id);
        return res.status(400).json({ message: "Invalid event ID" });
      }
      console.log(`Buscando evento ${eventId} para usu\xE1rio ${userId}`);
      const event = await storage.getEventById(eventId);
      if (!event) {
        console.log(`Evento ${eventId} n\xE3o encontrado`);
        return res.status(404).json({ message: "Event not found" });
      }
      const isOwner = event.ownerId === userId;
      console.log(`O usu\xE1rio \xE9 o propriet\xE1rio do evento? ${isOwner}`);
      const isTeamMember = await storage.isUserTeamMember(userId, eventId);
      console.log(`O usu\xE1rio \xE9 membro da equipe do evento? ${isTeamMember}`);
      if (!isOwner && !isTeamMember) {
        console.log(`Usu\xE1rio ${userId} n\xE3o tem acesso ao evento ${eventId}`);
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      console.log(`Retornando evento com feedbackUrl: ${event.feedbackUrl || "null"}`);
      return res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  app2.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const formData = eventFormSchema.parse(req.body);
      const tempCreateData = {
        name: formData.name,
        type: formData.type,
        format: formData.format,
        description: formData.description,
        location: formData.location,
        meetingUrl: formData.meetingUrl,
        budget: formData.budget,
        attendees: formData.attendees,
        coverImageUrl: "",
        // Will be updated after processing
        startTime: formData.startTime,
        endTime: formData.endTime,
        startDate: new Date(formData.startDate),
        ownerId: userId
      };
      if (formData.endDate) {
        tempCreateData.endDate = new Date(formData.endDate);
      }
      const event = await storage.createEvent(tempCreateData);
      let coverImageUrl = formData.coverImageUrl;
      if (coverImageUrl && coverImageUrl.startsWith("data:image/")) {
        try {
          coverImageUrl = saveBase64Image(coverImageUrl, event.id);
          console.log("[Debug API] Nova imagem salva para evento criado em:", coverImageUrl);
          await storage.updateEvent(event.id, { coverImageUrl });
        } catch (error) {
          console.error("[Debug API] Erro ao processar upload de imagem na cria\xE7\xE3o:", error);
        }
      }
      await storage.addTeamMember({
        eventId: event.id,
        userId,
        role: "organizer",
        permissions: JSON.stringify({ canDelete: true, canEdit: true, canInvite: true })
      });
      console.log("[AI Checklist] generateAIChecklist value:", formData.generateAIChecklist, "type:", typeof formData.generateAIChecklist);
      if (formData.generateAIChecklist) {
        console.log("[AI Checklist] Iniciando gera\xE7\xE3o de tarefas para evento:", event.id);
        try {
          const checklistItems = await generateEventChecklist(formData);
          console.log("[AI Checklist] Tarefas geradas:", checklistItems.length);
          for (const item of checklistItems) {
            await storage.createTask({
              title: item.title,
              description: item.description,
              dueDate: item.dueDate,
              priority: item.priority || "medium",
              eventId: event.id,
              assigneeId: userId
            });
          }
        } catch (error) {
          console.error("Error generating AI checklist:", error);
        }
      }
      await storage.createActivityLog({
        eventId: event.id,
        userId,
        action: "created_event",
        details: JSON.stringify({ eventName: event.name })
      });
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Invalid event data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  app2.get("/api/events/draft", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("[Draft] Buscando rascunho para usu\xE1rio:", userId);
      const draft = await storage.getDraftEventByUser(userId);
      if (!draft) {
        return res.status(404).json({ message: "No draft found" });
      }
      console.log("[Draft] Rascunho encontrado:", draft.id);
      res.json(draft);
    } catch (error) {
      console.error("Error fetching draft:", error);
      res.status(500).json({ message: "Failed to fetch draft" });
    }
  });
  app2.post("/api/events/draft", async (req, res, next) => {
    const queryToken = req.query.token;
    if (queryToken && !req.headers.authorization) {
      req.headers.authorization = `Bearer ${queryToken}`;
    }
    next();
  }, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const draftData = req.body;
      console.log("[Draft] Salvando rascunho para usu\xE1rio:", userId);
      const draftSchema = z3.object({
        name: z3.string().optional(),
        type: z3.string().optional(),
        format: z3.string().optional(),
        startDate: z3.string().optional(),
        endDate: z3.string().optional(),
        startTime: z3.string().optional(),
        endTime: z3.string().optional(),
        location: z3.string().optional(),
        meetingUrl: z3.string().optional(),
        description: z3.string().optional(),
        budget: z3.number().optional().nullable(),
        attendees: z3.number().optional().nullable(),
        coverImageUrl: z3.string().optional()
      });
      const validatedData = draftSchema.parse(draftData);
      const processedData = { ...validatedData };
      if (validatedData.startDate) {
        processedData.startDate = new Date(validatedData.startDate);
      }
      if (validatedData.endDate) {
        processedData.endDate = new Date(validatedData.endDate);
      }
      const draft = await storage.saveDraftEvent(userId, processedData);
      console.log("[Draft] Rascunho salvo com ID:", draft.id);
      res.json(draft);
    } catch (error) {
      console.error("Error saving draft:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Invalid draft data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to save draft" });
    }
  });
  app2.delete("/api/events/draft", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("[Draft] Deletando rascunho para usu\xE1rio:", userId);
      await storage.deleteDraftEvent(userId);
      res.json({ message: "Draft deleted successfully" });
    } catch (error) {
      console.error("Error deleting draft:", error);
      res.status(500).json({ message: "Failed to delete draft" });
    }
  });
  app2.put("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const formData = eventFormSchema.parse(req.body);
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.ownerId !== userId) {
        return res.status(403).json({ message: "Only the event owner can update it" });
      }
      let coverImageUrl = formData.coverImageUrl;
      if (coverImageUrl && coverImageUrl.startsWith("data:image/")) {
        try {
          if (event.coverImageUrl && event.coverImageUrl.startsWith("/uploads/")) {
            deleteImage(event.coverImageUrl);
          }
          coverImageUrl = saveBase64Image(coverImageUrl, eventId);
          console.log("[Debug API] Nova imagem salva em:", coverImageUrl);
        } catch (error) {
          console.error("[Debug API] Erro ao processar upload de imagem:", error);
          coverImageUrl = event.coverImageUrl || void 0;
        }
      }
      const updateData = {
        name: formData.name,
        type: formData.type,
        format: formData.format,
        description: formData.description,
        location: formData.location,
        meetingUrl: formData.meetingUrl,
        budget: formData.budget,
        attendees: formData.attendees,
        coverImageUrl,
        startTime: formData.startTime,
        endTime: formData.endTime,
        startDate: new Date(formData.startDate)
      };
      if (formData.endDate) {
        updateData.endDate = new Date(formData.endDate);
      }
      console.log("[Debug API] Formato recebido do cliente:", formData.format);
      console.log("[Debug API] Atualizando evento com formato:", updateData.format, "tipo:", typeof updateData.format);
      if ("date" in updateData) {
        delete updateData.date;
      }
      console.log("[Debug API] Dados finais para atualiza\xE7\xE3o:", JSON.stringify(updateData, null, 2));
      const updatedEvent = await storage.updateEvent(eventId, updateData);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "updated_event",
        details: JSON.stringify({ eventName: updatedEvent.name })
      });
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Invalid event data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  app2.patch("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (!req.body.status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const validStatuses = ["planning", "confirmed", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: "Invalid status",
          validValues: validStatuses
        });
      }
      const updatedEvent = await storage.updateEvent(eventId, {
        status: req.body.status
      });
      await storage.createActivityLog({
        eventId,
        userId,
        action: "status_updated",
        details: JSON.stringify({
          eventName: event.name,
          oldStatus: event.status,
          newStatus: req.body.status
        })
      });
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event status:", error);
      res.status(500).json({ message: "Failed to update event status" });
    }
  });
  app2.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.ownerId !== userId) {
        return res.status(403).json({ message: "Only the event owner can delete it" });
      }
      await storage.deleteEvent(eventId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  app2.get("/api/tasks/:taskId/assignees", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.taskId, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "ID de tarefa inv\xE1lido" });
      }
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Tarefa n\xE3o encontrada" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a esta tarefa" });
      }
      const assignees = await storage.getTaskAssignees(taskId);
      res.json(assignees);
    } catch (error) {
      console.error("Erro ao buscar respons\xE1veis da tarefa:", error);
      res.status(500).json({ message: "Falha ao buscar respons\xE1veis da tarefa" });
    }
  });
  app2.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "ID de tarefa inv\xE1lido" });
      }
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Tarefa n\xE3o encontrada" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a esta tarefa" });
      }
      res.json(task);
    } catch (error) {
      console.error("Erro ao buscar tarefa:", error);
      res.status(500).json({ message: "Falha ao buscar tarefa" });
    }
  });
  app2.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "ID de tarefa inv\xE1lido" });
      }
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Tarefa n\xE3o encontrada" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a esta tarefa" });
      }
      const { assigneeIds, ...taskDataRest } = req.body;
      const taskData = {
        ...taskDataRest,
        // Converter a data se existir
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : void 0
      };
      const updatedTask = await storage.updateTask(taskId, taskData, assigneeIds);
      await storage.createActivityLog({
        eventId: task.eventId,
        userId,
        action: "updated_task",
        details: JSON.stringify({ taskTitle: updatedTask.title })
      });
      res.json(updatedTask);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      res.status(500).json({ message: "Falha ao atualizar tarefa" });
    }
  });
  app2.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      console.log("Buscando todas as tarefas do usu\xE1rio");
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para buscar tarefas:", userId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        console.log("Usando ID de autentica\xE7\xE3o Replit para buscar tarefas:", userId);
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const events2 = await storage.getEventsByUser(userId);
      let allTasks = [];
      for (const event of events2) {
        const eventTasks = await storage.getTasksByEventId(event.id);
        const enhancedTasks = await Promise.all(eventTasks.map(async (task) => {
          try {
            const taskAssignees2 = await storage.getTaskAssignees(task.id);
            const assignees = taskAssignees2.map((assignee) => ({
              userId: assignee.userId,
              firstName: assignee.user.firstName,
              lastName: assignee.user.lastName,
              profileImageUrl: assignee.user.profileImageUrl,
              phone: assignee.user.phone
            }));
            return {
              ...task,
              eventName: event.name,
              assignees
            };
          } catch (error) {
            console.error(`Erro ao buscar respons\xE1veis para tarefa ${task.id}:`, error);
            return {
              ...task,
              eventName: event.name,
              assignees: []
            };
          }
        }));
        allTasks = [...allTasks, ...enhancedTasks];
      }
      allTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      console.log(`Retornando ${allTasks.length} tarefas para o usu\xE1rio ${userId}`);
      res.json(allTasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      res.status(500).json({ message: "Falha ao buscar tarefas" });
    }
  });
  app2.get("/api/events/:eventId/tasks", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar tarefas do evento:", req.params.eventId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao acessar tarefas do evento:", req.params.eventId);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      const tasks2 = await storage.getTasksByEventId(eventId);
      const enhancedTasks = await Promise.all(tasks2.map(async (task) => {
        try {
          const taskAssignees2 = await storage.getTaskAssignees(task.id);
          const assignees = taskAssignees2.map((assignee) => ({
            userId: assignee.userId,
            firstName: assignee.user.firstName,
            lastName: assignee.user.lastName,
            profileImageUrl: assignee.user.profileImageUrl,
            phone: assignee.user.phone
          }));
          return {
            ...task,
            assignees
          };
        } catch (error) {
          console.error(`Erro ao buscar respons\xE1veis para tarefa ${task.id}:`, error);
          return {
            ...task,
            assignees: []
          };
        }
      }));
      res.json(enhancedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.get("/api/events/:eventId/vendors", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      const vendors2 = await storage.getVendorsByEventId(eventId);
      console.log(`Retornando ${vendors2.length} fornecedores para o evento ${eventId}`);
      console.log("Fornecedores:", JSON.stringify(vendors2).substring(0, 200) + "...");
      if (vendors2 && Array.isArray(vendors2)) {
        res.json(vendors2);
      } else {
        console.error("ERRO: Dados de fornecedores inv\xE1lidos:", vendors2);
        res.status(500).json({ message: "Invalid vendor data format" });
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  app2.post("/api/events/:eventId/vendors", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      if (!req.body.name || !req.body.service) {
        return res.status(400).json({ message: "Name and service are required" });
      }
      const vendorData = {
        ...req.body,
        eventId,
        cost: req.body.cost ? parseFloat(req.body.cost) : null
      };
      const vendor = await storage.createVendor(vendorData);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "vendor_added",
        details: JSON.stringify({ vendorName: vendor.name, service: vendor.service })
      });
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  app2.put("/api/vendors/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendorId = parseInt(req.params.id, 10);
      if (isNaN(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      const vendor = await storage.getVendorById(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, vendor.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this vendor" });
      }
      const vendorData = {
        ...req.body,
        cost: req.body.cost ? parseFloat(req.body.cost) : null
      };
      const updatedVendor = await storage.updateVendor(vendorId, vendorData);
      await storage.createActivityLog({
        eventId: vendor.eventId,
        userId,
        action: "vendor_updated",
        details: JSON.stringify({ vendorName: updatedVendor.name, service: updatedVendor.service })
      });
      res.json(updatedVendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  app2.delete("/api/vendors/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendorId = parseInt(req.params.id, 10);
      if (isNaN(vendorId)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      const vendor = await storage.getVendorById(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, vendor.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this vendor" });
      }
      await storage.deleteVendor(vendorId);
      await storage.createActivityLog({
        eventId: vendor.eventId,
        userId,
        action: "vendor_deleted",
        details: JSON.stringify({ vendorName: vendor.name, service: vendor.service })
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });
  app2.get("/api/events/:eventId/budget", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este evento" });
      }
      const budgetItems2 = await storage.getBudgetItemsByEventId(eventId);
      console.log(`Retornando ${budgetItems2.length} itens de or\xE7amento para o evento ${eventId}`);
      res.json(budgetItems2);
    } catch (error) {
      console.error("Erro ao buscar itens de or\xE7amento:", error);
      res.status(500).json({ message: "Falha ao buscar itens de or\xE7amento" });
    }
  });
  app2.post("/api/events/:eventId/budget", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este evento" });
      }
      const budgetItemSchema = insertExpenseSchema;
      const validatedData = budgetItemSchema.parse({
        ...req.body,
        eventId,
        amount: parseFloat(req.body.amount),
        paid: req.body.paid || false
      });
      const budgetItem = await storage.createBudgetItem(validatedData);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "budget_item_added",
        details: JSON.stringify({
          itemName: budgetItem.name,
          category: budgetItem.category,
          amount: budgetItem.amount
        })
      });
      res.status(201).json(budgetItem);
    } catch (error) {
      console.error("Erro ao adicionar item ao or\xE7amento:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos para o item de or\xE7amento",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Falha ao adicionar item ao or\xE7amento" });
    }
  });
  app2.put("/api/budget/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID de item inv\xE1lido" });
      }
      const budgetItem = await storage.getBudgetItemById(itemId);
      if (!budgetItem) {
        return res.status(404).json({ message: "Item de or\xE7amento n\xE3o encontrado" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, budgetItem.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este item" });
      }
      const updateSchema = insertExpenseSchema.partial();
      const updateData = updateSchema.parse({
        ...req.body,
        amount: req.body.amount ? parseFloat(req.body.amount) : void 0
      });
      const updatedItem = await storage.updateBudgetItem(itemId, updateData);
      await storage.createActivityLog({
        eventId: budgetItem.eventId,
        userId,
        action: "budget_item_updated",
        details: JSON.stringify({
          itemName: updatedItem.name,
          category: updatedItem.category,
          amount: updatedItem.amount
        })
      });
      res.json(updatedItem);
    } catch (error) {
      console.error("Erro ao atualizar item do or\xE7amento:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos para o item de or\xE7amento",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Falha ao atualizar item do or\xE7amento" });
    }
  });
  app2.delete("/api/budget/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID de item inv\xE1lido" });
      }
      const budgetItem = await storage.getBudgetItemById(itemId);
      if (!budgetItem) {
        return res.status(404).json({ message: "Item de or\xE7amento n\xE3o encontrado" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, budgetItem.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este item" });
      }
      await storage.deleteBudgetItem(itemId);
      await storage.createActivityLog({
        eventId: budgetItem.eventId,
        userId,
        action: "budget_item_deleted",
        details: JSON.stringify({
          itemName: budgetItem.name,
          category: budgetItem.category,
          amount: budgetItem.amount
        })
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro ao excluir item do or\xE7amento:", error);
      res.status(500).json({ message: "Falha ao excluir item do or\xE7amento" });
    }
  });
  app2.get("/api/events/:eventId/schedule", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este evento" });
      }
      const result = await db.execute(`
        SELECT id, event_id as "eventId", title, description, event_date as "eventDate", 
               start_time as "startTime", location, responsibles, 
               created_at as "createdAt", updated_at as "updatedAt" 
        FROM schedule_items 
        WHERE event_id = ${eventId} 
        ORDER BY event_date ASC, start_time ASC
      `);
      console.log(`Cronograma evento ${eventId} - ${result.rows.length} itens encontrados:`, result.rows);
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      });
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar itens do cronograma:", error);
      res.status(500).json({ message: "Falha ao buscar itens do cronograma" });
    }
  });
  app2.post("/api/events/:eventId/schedule", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este evento" });
      }
      const { title, description, eventDate, startTime, location, responsibles } = req.body;
      if (!title || !startTime) {
        return res.status(400).json({
          message: "T\xEDtulo e hor\xE1rio de in\xEDcio s\xE3o obrigat\xF3rios"
        });
      }
      const eventDateValue = eventDate ? `'${eventDate}'` : "NULL";
      const result = await db.execute(`
        INSERT INTO schedule_items (event_id, title, description, event_date, start_time, location, responsibles, created_at, updated_at)
        VALUES (${eventId}, '${title}', ${description ? `'${description}'` : "NULL"}, ${eventDateValue}, '${startTime}', ${location ? `'${location}'` : "NULL"}, ${responsibles ? `'${responsibles}'` : "NULL"}, NOW(), NOW())
        RETURNING *
      `);
      const newItem = result.rows[0];
      await storage.createActivityLog({
        eventId,
        userId,
        action: "schedule_item_created",
        details: JSON.stringify({
          title,
          startTime
        })
      });
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Erro ao adicionar item ao cronograma:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos para o item do cronograma",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Falha ao adicionar item ao cronograma" });
    }
  });
  app2.put("/api/schedule/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID de item inv\xE1lido" });
      }
      const scheduleItem = await db.select().from(scheduleItems).where(eq3(scheduleItems.id, itemId)).limit(1);
      if (!scheduleItem || scheduleItem.length === 0) {
        return res.status(404).json({ message: "Item do cronograma n\xE3o encontrado" });
      }
      const item = scheduleItem[0];
      const hasAccess = await storage.hasUserAccessToEvent(userId, item.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este item" });
      }
      const { title, description, startTime, location, responsibles } = req.body;
      if (!title || !startTime) {
        return res.status(400).json({
          message: "T\xEDtulo e hor\xE1rio de in\xEDcio s\xE3o obrigat\xF3rios"
        });
      }
      const updateResult = await db.execute(`
        UPDATE schedule_items 
        SET title = '${title.replace(/'/g, "''")}', 
            description = ${description ? `'${description.replace(/'/g, "''")}'` : "NULL"}, 
            start_time = '${startTime}', 
            location = ${location ? `'${location.replace(/'/g, "''")}'` : "NULL"}, 
            responsibles = ${responsibles ? `'${responsibles.replace(/'/g, "''")}'` : "NULL"}, 
            updated_at = NOW()
        WHERE id = ${itemId}
        RETURNING *
      `);
      const updatedItem = updateResult.rows[0];
      await storage.createActivityLog({
        eventId: item.eventId,
        userId,
        action: "schedule_item_updated",
        details: JSON.stringify({
          title,
          startTime
        })
      });
      res.json(updatedItem[0]);
    } catch (error) {
      console.error("Erro ao atualizar item do cronograma:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos para o item do cronograma",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Falha ao atualizar item do cronograma" });
    }
  });
  app2.delete("/api/schedule/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID de item inv\xE1lido" });
      }
      const scheduleItem = await db.select().from(scheduleItems).where(eq3(scheduleItems.id, itemId)).limit(1);
      if (!scheduleItem || scheduleItem.length === 0) {
        return res.status(404).json({ message: "Item do cronograma n\xE3o encontrado" });
      }
      const item = scheduleItem[0];
      const hasAccess = await storage.hasUserAccessToEvent(userId, item.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Voc\xEA n\xE3o tem acesso a este item" });
      }
      await db.delete(scheduleItems).where(eq3(scheduleItems.id, itemId));
      await storage.createActivityLog({
        eventId: item.eventId,
        userId,
        action: "schedule_item_deleted",
        details: JSON.stringify({
          title: item.title,
          startTime: item.startTime
        })
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro ao excluir item do cronograma:", error);
      res.status(500).json({ message: "Falha ao excluir item do cronograma" });
    }
  });
  app2.post("/api/events/:eventId/tasks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      const taskData = {
        ...req.body,
        eventId
      };
      const validatedTaskData = insertTaskSchema.parse(taskData);
      const taskDataToCreate = {
        ...validatedTaskData
      };
      if (validatedTaskData.dueDate) {
        taskDataToCreate.dueDate = new Date(validatedTaskData.dueDate);
      }
      const task = await storage.createTask(taskDataToCreate);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "created_task",
        details: JSON.stringify({ taskTitle: task.title })
      });
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Invalid task data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  app2.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      const updatedTask = await storage.updateTask(taskId, req.body);
      await storage.createActivityLog({
        eventId: task.eventId,
        userId,
        action: "updated_task",
        details: JSON.stringify({
          taskTitle: updatedTask.title,
          changes: req.body.status ? { status: req.body.status } : {}
        })
      });
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  app2.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, task.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this task" });
      }
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  app2.get("/api/events/:eventId/team", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar equipe do evento:", req.params.eventId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao acessar equipe do evento:", req.params.eventId);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
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
  app2.post("/api/events/:eventId/team", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      const { userIds, email, role, name, phone } = req.body;
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        const addedMembers2 = [];
        for (const memberId of userIds) {
          try {
            console.log(`Tentando adicionar membro ${memberId} ao evento ${eventId}`);
            const teamMember = await storage.addTeamMember({
              eventId,
              userId: memberId,
              role: "team_member",
              permissions: JSON.stringify({
                canEdit: true,
                canDelete: false,
                canInvite: false
              })
            });
            if (teamMember) {
              addedMembers2.push(teamMember);
              console.log(`Membro ${memberId} adicionado com sucesso ao evento ${eventId}`);
            }
          } catch (memberError) {
            console.error(`Error adding member ${memberId}:`, memberError);
          }
        }
        res.status(201).json({
          message: `${addedMembers2.length} member(s) added successfully`,
          addedMembers: addedMembers2
        });
        return;
      } else if (email && role) {
        try {
          const member = await storage.findOrCreateUserByEmail(email, name, phone);
          const teamMember = await storage.addTeamMember({
            eventId,
            userId: member.id,
            role,
            permissions: JSON.stringify(role === "organizer" ? {
              canEdit: true,
              canDelete: true,
              canInvite: true
            } : {
              canEdit: true,
              canDelete: false,
              canInvite: false
            })
          });
          await storage.createActivityLog({
            eventId,
            userId,
            action: "added_team_member",
            details: JSON.stringify({ memberEmail: email, memberRole: role })
          });
          res.status(201).json({
            message: "Team member added successfully",
            teamMember
          });
          return;
        } catch (error) {
          console.error("Error adding team member:", error);
          return res.status(500).json({ message: "Failed to add team member" });
        }
      } else {
        return res.status(400).json({
          message: "Either userIds array or email/role are required"
        });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      const addedMembers = [];
      for (const memberId of userIds) {
        try {
          console.log(`Tentando adicionar membro ${memberId} ao evento ${eventId}`);
          const teamMember = await storage.addTeamMember({
            eventId,
            userId: memberId,
            role: "team_member",
            permissions: JSON.stringify({
              canEdit: true,
              canDelete: false,
              canInvite: false
            })
          });
          if (teamMember) {
            addedMembers.push(teamMember);
            console.log(`Membro ${memberId} adicionado com sucesso ao evento ${eventId}`);
          }
        } catch (memberError) {
          console.error(`Error adding member ${memberId}:`, memberError);
        }
      }
      res.status(201).json({
        message: `${addedMembers.length} member(s) added successfully`,
        addedMembers
      });
    } catch (error) {
      console.error("Error adding team members:", error);
      res.status(500).json({ message: "Failed to add team members" });
    }
  });
  app2.delete("/api/events/:eventId/team/:userId", isAuthenticated, async (req, res) => {
    try {
      let currentUserId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        currentUserId = req.session.devUserId;
      } else if (req.user?.claims?.sub) {
        currentUserId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      const userIdToRemove = req.params.userId;
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(currentUserId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      const teamMembers = await storage.getTeamMembersByEventId(eventId);
      const currentUserMember = teamMembers.find((member) => member.userId === currentUserId);
      const event = await storage.getEventById(eventId);
      const isOwner = event?.ownerId === currentUserId;
      const isOrganizer = currentUserMember?.role === "organizer";
      if (!isOwner && !isOrganizer) {
        return res.status(403).json({ message: "Apenas organizadores podem remover membros da equipe" });
      }
      const memberToRemove = teamMembers.find((member) => member.id.toString() === userIdToRemove);
      if (!memberToRemove) {
        return res.status(404).json({ message: "Team member not found" });
      }
      if (event?.ownerId === memberToRemove.userId) {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel remover o propriet\xE1rio do evento" });
      }
      await storage.removeTeamMember(eventId, memberToRemove.userId);
      await storage.createActivityLog({
        eventId,
        userId: currentUserId,
        action: "removed_team_member",
        details: JSON.stringify({ removedUserId: userIdToRemove })
      });
      res.status(204).send();
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(500).json({ message: "Failed to remove team member" });
    }
  });
  app2.post("/api/events/:eventId/team", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.ownerId !== userId) {
        return res.status(403).json({ message: "Only the event owner can add team members" });
      }
      if (!req.body.email || !req.body.role) {
        return res.status(400).json({ message: "Email and role are required" });
      }
      const member = await storage.findOrCreateUserByEmail(req.body.email);
      const teamMember = await storage.addTeamMember({
        eventId,
        userId: member.id,
        role: req.body.role,
        permissions: typeof req.body.permissions === "object" ? JSON.stringify(req.body.permissions || {}) : req.body.permissions || "{}"
      });
      await storage.createActivityLog({
        eventId,
        userId,
        action: "added_team_member",
        details: JSON.stringify({ memberEmail: req.body.email, role: req.body.role })
      });
      res.status(201).json(teamMember);
    } catch (error) {
      console.error("Error adding team member:", error);
      res.status(500).json({ message: "Failed to add team member" });
    }
  });
  app2.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!req.body) {
        return res.status(400).json({ message: "Profile data is required" });
      }
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.upsertUser({
        ...currentUser,
        firstName: req.body.firstName !== void 0 ? req.body.firstName : currentUser.firstName,
        lastName: req.body.lastName !== void 0 ? req.body.lastName : currentUser.lastName,
        phone: req.body.phone !== void 0 ? req.body.phone : currentUser.phone,
        profileImageUrl: req.body.profileImageUrl !== void 0 ? req.body.profileImageUrl : currentUser.profileImageUrl
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  app2.put("/api/user/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });
  app2.get("/api/auth/check", isAuthenticated, async (req, res) => {
    return res.json({ authenticated: true, userId: req.user.claims.sub });
  });
  app2.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        debugLog(`DASHBOARD: using DEV session userId=${userId}`);
        console.log(`Buscando dados do dashboard para o usu\xE1rio de desenvolvimento: ${userId}`);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        debugLog(`DASHBOARD: using claims.sub userId=${userId}, email=${req.user?.claims?.email}`);
        console.log(`Buscando dados do dashboard para o usu\xE1rio autenticado: ${userId}`);
      } else {
        debugLog(`DASHBOARD: NO USER ID FOUND - returning 401`);
        return res.status(401).json({ message: "Unauthorized" });
      }
      const events2 = await storage.getEventsByUser(userId);
      debugLog(`DASHBOARD: getEventsByUser(${userId}) returned ${events2.length} events`);
      console.log(`Total de eventos encontrados: ${events2.length}`);
      const activeEvents = events2.filter(
        (event) => event.status === "planning" || event.status === "confirmed" || event.status === "in_progress" || event.status === "active"
      );
      console.log(`Eventos ativos encontrados: ${activeEvents.length}`);
      const activeEventsWithDetails = await Promise.all(
        activeEvents.map(async (event) => {
          const tasks2 = await storage.getTasksByEventId(event.id);
          const team = await storage.getTeamMembersByEventId(event.id);
          console.log(`Evento ${event.id} - ${event.name}: ${tasks2.length} tarefas, ${team.length} membros na equipe`);
          return {
            ...event,
            team,
            tasks: tasks2
          };
        })
      );
      activeEventsWithDetails.sort((a, b) => {
        const dateA = new Date(a.startDate || "2099-12-31");
        const dateB = new Date(b.startDate || "2099-12-31");
        return dateA.getTime() - dateB.getTime();
      });
      const today = /* @__PURE__ */ new Date();
      today.setUTCHours(0, 0, 0, 0);
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      const upcomingEvents = events2.filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate >= today && eventDate <= thirtyDaysFromNow;
      });
      let pendingTasks = [];
      for (const event of events2) {
        const tasks2 = await storage.getTasksByEventId(event.id);
        pendingTasks = pendingTasks.concat(
          tasks2.filter((task) => task.status !== "completed")
        );
      }
      let recentActivities = [];
      for (const event of events2) {
        const activities = await storage.getActivityLogsByEventId(event.id);
        recentActivities = recentActivities.concat(activities);
      }
      recentActivities.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      recentActivities = recentActivities.slice(0, 10);
      res.json({
        totalEvents: events2.length,
        activeEvents: activeEvents.length,
        activeEventsList: activeEventsWithDetails,
        // Nova propriedade com eventos ativos
        upcomingEvents,
        pendingTasks,
        recentActivities
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  app2.get("/api/events/:eventId/activities", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar atividades do evento:", req.params.eventId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao acessar atividades do evento:", req.params.eventId);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
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
  app2.post("/api/events/:eventId/generate-checklist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this event" });
      }
      const event = await storage.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const checklistItems = await generateEventChecklist({
        name: event.name,
        type: event.type,
        startDate: event.startDate ? event.startDate.toISOString() : "",
        location: event.location || void 0,
        description: event.description || void 0,
        budget: event.budget || void 0,
        attendees: event.attendees || void 0,
        generateAIChecklist: true
      });
      const tasks2 = [];
      for (const item of checklistItems) {
        const task = await storage.createTask({
          title: item.title,
          description: item.description,
          dueDate: item.dueDate,
          priority: item.priority || "medium",
          eventId: event.id,
          assigneeId: userId
        }, [userId]);
        tasks2.push(task);
      }
      await storage.createActivityLog({
        eventId,
        userId,
        action: "generated_ai_checklist",
        details: JSON.stringify({ taskCount: tasks2.length })
      });
      res.status(201).json(tasks2);
    } catch (error) {
      console.error("Error generating AI checklist:", error);
      res.status(500).json({ message: "Failed to generate AI checklist" });
    }
  });
  app2.get("/api/events/:eventId/expenses", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar despesas do evento:", req.params.eventId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao acessar despesas do evento:", req.params.eventId);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const expenses2 = await storage.getExpensesByEventId(eventId);
      console.log(`Despesas brutas do banco para evento ${eventId}:`, expenses2);
      console.log(`Retornando ${expenses2 ? expenses2.length : 0} despesas para o evento ${eventId}`);
      const validExpenses = Array.isArray(expenses2) ? expenses2 : [];
      console.log(`Despesas v\xE1lidas sendo enviadas:`, validExpenses);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(validExpenses);
    } catch (error) {
      console.error("Erro ao obter despesas:", error);
      return res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.post("/api/events/:eventId/expenses", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para adicionar despesa:", userId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao adicionar despesa");
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const { expenseFormSchema: expenseFormSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const cleanedBody = {
        ...req.body,
        paymentDate: req.body.paymentDate === null ? "" : req.body.paymentDate,
        dueDate: req.body.dueDate === null ? "" : req.body.dueDate,
        eventId
      };
      const formData = expenseFormSchema2.parse(cleanedBody);
      const validatedData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate) : null
      };
      const { id, ...createData } = validatedData;
      const expense = await storage.createExpense(createData);
      const allExpenses = await storage.getExpensesByEventId(eventId);
      const totalExpenses = allExpenses.filter((e) => e.amount < 0).reduce((sum, e) => sum + e.amount, 0);
      await db.update(events).set({ expenses: totalExpenses }).where(eq3(events.id, eventId));
      await storage.createActivityLog({
        eventId,
        userId,
        action: "expense_added",
        details: JSON.stringify({
          itemName: expense.name,
          category: expense.category,
          amount: expense.amount,
          vendorId: expense.vendorId
        })
      });
      res.status(201).json(expense);
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.put("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      console.log("PUT /api/expenses/:id - Dados recebidos:", req.body);
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para atualizar despesa:", userId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        console.log("Usando ID de autentica\xE7\xE3o Replit para atualizar despesa:", userId);
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao atualizar despesa");
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const expense = await storage.getExpenseById(itemId);
      if (!expense) {
        return res.status(404).json({ message: "Despesa n\xE3o encontrada" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, expense.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para executar esta a\xE7\xE3o" });
      }
      const validatedUpdates = insertExpenseSchema.partial().parse(req.body);
      console.log("Dados validados para atualiza\xE7\xE3o:", validatedUpdates);
      const updatedExpense = await storage.updateExpense(itemId, validatedUpdates);
      console.log("Despesa atualizada com sucesso:", updatedExpense);
      const allExpenses = await storage.getExpensesByEventId(expense.eventId);
      const totalExpenses = allExpenses.filter((e) => e.amount < 0).reduce((sum, e) => sum + e.amount, 0);
      await db.update(events).set({ expenses: totalExpenses }).where(eq3(events.id, expense.eventId));
      await storage.createActivityLog({
        eventId: expense.eventId,
        userId,
        action: "expense_updated",
        details: JSON.stringify({
          itemName: updatedExpense.name,
          amount: updatedExpense.amount,
          paid: updatedExpense.paid
        })
      });
      res.json(updatedExpense);
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.put("/api/events/:eventId/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      console.log("PUT /api/events/:eventId/expenses/:id - Dados recebidos:", req.body);
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para atualizar despesa:", userId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        console.log("Usando ID de autentica\xE7\xE3o Replit para atualizar despesa:", userId);
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao atualizar despesa");
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId) || isNaN(eventId)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para executar esta a\xE7\xE3o" });
      }
      const expense = await storage.getExpenseById(itemId);
      if (!expense || expense.eventId !== eventId) {
        return res.status(404).json({ message: "Despesa n\xE3o encontrada" });
      }
      const bodyWithDates = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : void 0,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : void 0
      };
      const validatedUpdates = insertExpenseSchema.partial().parse(bodyWithDates);
      console.log("Dados validados para atualiza\xE7\xE3o:", validatedUpdates);
      const updatedExpense = await storage.updateExpense(itemId, validatedUpdates);
      console.log("Despesa atualizada com sucesso:", updatedExpense);
      const allExpenses = await storage.getExpensesByEventId(eventId);
      const totalExpenses = allExpenses.filter((e) => e.amount < 0).reduce((sum, e) => sum + e.amount, 0);
      await db.update(events).set({ expenses: totalExpenses }).where(eq3(events.id, eventId));
      await storage.createActivityLog({
        eventId: expense.eventId,
        userId,
        action: "expense_updated",
        details: JSON.stringify({
          itemName: updatedExpense.name,
          amount: updatedExpense.amount,
          paid: updatedExpense.paid
        })
      });
      res.json(updatedExpense);
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.patch("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para atualizar despesa (PATCH):", userId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao atualizar despesa (PATCH)");
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const expense = await storage.getExpenseById(itemId);
      if (!expense) {
        return res.status(404).json({ message: "Despesa n\xE3o encontrada" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, expense.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para executar esta a\xE7\xE3o" });
      }
      const validatedUpdates = insertExpenseSchema.partial().parse(req.body);
      const updatedExpense = await storage.updateExpense(itemId, validatedUpdates);
      await storage.createActivityLog({
        eventId: expense.eventId,
        userId,
        action: "expense_updated",
        details: JSON.stringify({
          itemName: updatedExpense.name,
          amount: updatedExpense.amount,
          paid: updatedExpense.paid
        })
      });
      res.json(updatedExpense);
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.delete("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const expense = await storage.getExpenseById(itemId);
      if (!expense) {
        return res.status(404).json({ message: "Despesa n\xE3o encontrada" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, expense.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para executar esta a\xE7\xE3o" });
      }
      await storage.deleteExpense(itemId);
      const allExpenses = await storage.getExpensesByEventId(expense.eventId);
      const totalExpenses = allExpenses.filter((e) => e.amount < 0).reduce((sum, e) => sum + e.amount, 0);
      await db.update(events).set({ expenses: totalExpenses }).where(eq3(events.id, expense.eventId));
      await storage.createActivityLog({
        eventId: expense.eventId,
        userId,
        action: "expense_deleted",
        details: JSON.stringify({
          itemName: expense.name,
          category: expense.category,
          amount: expense.amount
        })
      });
      res.status(200).json({ message: "Despesa exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.use("/api", scheduleRoutes_default);
  app2.use("/api", cronogramaRoutes_default);
  setupCronogramaRoute(app2);
  app2.get("/api/events/:eventId/documents", isAuthenticated, async (req, res) => {
    try {
      let userId;
      if (req.session.devIsAuthenticated && req.session.devUserId) {
        userId = req.session.devUserId;
        console.log("Usando ID de desenvolvimento para acessar documentos do evento:", req.params.eventId);
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        console.log("Erro na autentica\xE7\xE3o do usu\xE1rio ao acessar documentos do evento:", req.params.eventId);
        return res.status(401).json({ message: "User not authenticated properly" });
      }
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const documents2 = await storage.getDocumentsByEventId(eventId);
      console.log(`Retornando ${documents2.length} documentos para o evento ${eventId}`);
      res.json(documents2);
    } catch (error) {
      console.error("Erro ao obter documentos:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.get("/api/events/:eventId/documents/category/:category", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      const category = req.params.category;
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const documents2 = await storage.getDocumentsByCategory(eventId, category);
      console.log(`Retornando ${documents2.length} documentos da categoria ${category} para o evento ${eventId}`);
      res.json(documents2);
    } catch (error) {
      console.error("Erro ao obter documentos por categoria:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  const documentUploadAuth = async (req, res, next) => {
    console.log("=== MIDDLEWARE DE UPLOAD DE DOCUMENTO ===");
    console.log("- URL:", req.url);
    console.log("- Method:", req.method);
    const user = req.user;
    if (!user || !user.claims || !user.claims.sub) {
      console.log("Usu\xE1rio n\xE3o autenticado para upload");
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("Usu\xE1rio autorizado para upload:", user.claims.sub);
    return next();
  };
  app2.post("/api/events/:eventId/documents", documentUploadAuth, upload.single("file"), async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      console.log("=== IN\xCDCIO DO UPLOAD DE DOCUMENTO ===");
      console.log("Dados recebidos para upload de documento:");
      console.log("- req.body completo:", JSON.stringify(req.body, null, 2));
      console.log("- req.file completo:", req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : "null");
      console.log("- Campos espec\xEDficos do form:");
      console.log("  - filename enviado:", req.body.filename, typeof req.body.filename);
      console.log("  - category enviada:", req.body.category, typeof req.body.category);
      console.log("  - description enviada:", req.body.description, typeof req.body.description);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inv\xE1lido" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo foi enviado" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const fileExtension = req.file.mimetype;
      const fileUrl = `/uploads/${req.file.filename}`;
      const fileName = req.body.filename && req.body.filename.trim() !== "" ? req.body.filename : req.file.originalname;
      const documentData = {
        name: fileName,
        category: req.body.category || "outros",
        description: req.body.description && req.body.description.trim() !== "" ? req.body.description : null,
        fileUrl,
        fileType: fileExtension || "unknown",
        uploadedById: userId,
        eventId
      };
      console.log("Dados processados para inser\xE7\xE3o:", documentData);
      const document = await storage.createDocument(documentData);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "document_added",
        details: JSON.stringify({
          filename: document.name,
          category: document.category
        })
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Erro ao criar documento:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos para o documento",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.put("/api/events/:eventId/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      const documentId = parseInt(req.params.id, 10);
      if (isNaN(eventId) || isNaN(documentId)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento n\xE3o encontrado" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, document.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para executar esta a\xE7\xE3o" });
      }
      const validatedUpdates = insertDocumentSchema.partial().parse(req.body);
      const updatedDocument = await storage.updateDocument(documentId, validatedUpdates);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "document_updated",
        details: JSON.stringify({
          entityType: "document",
          entityId: documentId.toString(),
          documentName: updatedDocument.name
        })
      });
      res.json(updatedDocument);
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.delete("/api/events/:eventId/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId, 10);
      const documentId = parseInt(req.params.id, 10);
      if (isNaN(eventId) || isNaN(documentId)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento n\xE3o encontrado" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, document.eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para executar esta a\xE7\xE3o" });
      }
      const documentInfo = { ...document };
      await storage.deleteDocument(documentId);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "document_deleted",
        details: JSON.stringify({
          entityType: "document",
          entityId: documentId.toString(),
          documentName: documentInfo.name
        })
      });
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  const processParticipantFile = async (filePath, eventId) => {
    const extension = path2.extname(filePath).toLowerCase();
    const validParticipants = [];
    const invalidRecords = [];
    if (extension === ".csv") {
      return new Promise((resolve, reject) => {
        const results = [];
        fs2.createReadStream(filePath).pipe(csvParser()).on("data", (data) => results.push(data)).on("end", () => {
          results.forEach((row, index) => {
            const errors = [];
            if (!row.nome && !row.name) {
              errors.push("Nome \xE9 obrigat\xF3rio");
            }
            const email = row.email || row["e-mail"] || "";
            if (email && !isValidEmail(email)) {
              errors.push("E-mail inv\xE1lido");
            }
            const phone = row.telefone || row.phone || "";
            if (phone && !isValidPhone(phone)) {
              errors.push("Telefone inv\xE1lido");
            }
            if (errors.length > 0) {
              invalidRecords.push({
                line: index + 2,
                // +2 because CSV starts at line 1 and we skip header
                data: row,
                errors
              });
            } else {
              validParticipants.push({
                eventId,
                name: row.nome || row.name,
                email: email || null,
                phone: phone || null,
                status: "pending",
                origin: "csv"
              });
            }
          });
          resolve({
            validParticipants,
            invalidRecords,
            stats: {
              total: results.length,
              valid: validParticipants.length,
              invalid: invalidRecords.length
            }
          });
        }).on("error", reject);
      });
    } else if (extension === ".xlsx") {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      data.forEach((row, index) => {
        const errors = [];
        if (!row.nome && !row.name) {
          errors.push("Nome \xE9 obrigat\xF3rio");
        }
        const email = row.email || row["e-mail"] || "";
        if (email && !isValidEmail(email)) {
          errors.push("E-mail inv\xE1lido");
        }
        const phone = row.telefone || row.phone || "";
        if (phone && !isValidPhone(phone)) {
          errors.push("Telefone inv\xE1lido");
        }
        if (errors.length > 0) {
          invalidRecords.push({
            line: index + 2,
            // +2 because Excel starts at line 1 and we skip header
            data: row,
            errors
          });
        } else {
          validParticipants.push({
            eventId,
            name: row.nome || row.name,
            email: email || null,
            phone: phone || null,
            status: "pending",
            origin: "csv"
          });
        }
      });
      return {
        validParticipants,
        invalidRecords,
        stats: {
          total: data.length,
          valid: validParticipants.length,
          invalid: invalidRecords.length
        }
      };
    }
    throw new Error("Formato de arquivo n\xE3o suportado");
  };
  const participantUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const timestamp2 = Date.now();
        const extension = path2.extname(file.originalname);
        cb(null, `participants-${timestamp2}${extension}`);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    // 10MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /csv|xlsx/;
      const extname = allowedTypes.test(path2.extname(file.originalname).toLowerCase());
      const mimetype = file.mimetype === "text/csv" || file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.mimetype === "application/vnd.ms-excel";
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Apenas arquivos CSV e XLSX s\xE3o permitidos"));
      }
    }
  });
  app2.get("/api/events/:eventId/participants", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = "8650891";
      console.log("\u{1F3AF} LISTAGEM PARTICIPANTES - ID:", userId, "EventID:", eventId);
      if (eventId === 5) {
        const participants3 = await storage.getParticipantsByEventId(eventId);
        const stats2 = await storage.getParticipantStats(eventId);
        console.log("\u2705 Participantes encontrados:", participants3.length);
        console.log("\u2705 Stats:", stats2);
        return res.json({ participants: participants3, stats: stats2 });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const participants2 = await storage.getParticipantsByEventId(eventId);
      const stats = await storage.getParticipantStats(eventId);
      res.json({ participants: participants2, stats });
    } catch (error) {
      console.error("Erro ao buscar participantes:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.post("/api/events/:eventId/participants", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = "8650891";
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const participantData = insertParticipantSchema.parse({
        ...req.body,
        eventId,
        origin: "manual"
      });
      const participant = await storage.createParticipant(participantData);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "create_participant",
        details: JSON.stringify({ participantName: participant.name })
      });
      res.status(201).json(participant);
    } catch (error) {
      console.error("Erro ao criar participante:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isServerless) {
    console.log("Running in serverless mode \u2014 skipping HTTP server creation");
  }
  const httpServer = isServerless ? null : createServer(app2);
  if (httpServer) {
    httpServer.on("request", (req, res) => {
      if (req.method === "POST" && req.url?.includes("/upload-participants-final/")) {
        const eventId = req.url.split("/")[2];
        console.log("\u{1F525} UPLOAD FINAL FUNCIONANDO!");
        console.log("EventId:", eventId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Upload funcionando!" }));
        return;
      }
    });
  }
  app2.post("/upload-participants-fixed/:eventId", participantUpload.single("file"), async (req, res) => {
    console.log("\u{1F525} UPLOAD FUNCIONANDO AGORA!");
    console.log("Arquivo recebido:", req.file?.originalname);
    console.log("EventId:", req.params.eventId);
    console.log("User: 8650891");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    try {
      const eventId = parseInt(req.params.eventId);
      const sessionUserId = "8650891";
      console.log("\u{1F3AF} USANDO ID FIXO:", sessionUserId);
      if (!sessionUserId) {
        console.log("\u274C Usu\xE1rio n\xE3o autenticado - sem sess\xE3o");
        return res.status(401).json({ message: "Usu\xE1rio n\xE3o autenticado" });
      }
      if (!req.file) {
        console.log("\u274C Nenhum arquivo enviado");
        return res.status(400).json({ message: "Nenhum arquivo foi enviado" });
      }
      console.log("\u2705 Arquivo recebido:", req.file.filename, "Tamanho:", req.file.size);
      console.log("\u{1F527} Verificando acesso para userId:", sessionUserId, "eventId:", eventId);
      const hasAccess = await storage.hasUserAccessToEvent(sessionUserId, eventId);
      console.log("\u{1F527} Resultado hasAccess:", hasAccess);
      if (!hasAccess) {
        console.log("\u274C Sem acesso ao evento - userId:", sessionUserId, "eventId:", eventId);
        if (fs2.existsSync(req.file.path)) {
          fs2.unlinkSync(req.file.path);
        }
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      console.log("\u2705 Acesso ao evento confirmado");
      const result = await processParticipantFile(req.file.path, eventId);
      console.log("\u2705 Arquivo processado, participantes v\xE1lidos:", result.validParticipants.length);
      if (fs2.existsSync(req.file.path)) {
        fs2.unlinkSync(req.file.path);
      }
      if (result.validParticipants.length > 500) {
        console.log("\u274C Limite excedido:", result.validParticipants.length);
        return res.status(400).json({
          message: "Limite de 500 participantes por importa\xE7\xE3o excedido",
          stats: result.stats
        });
      }
      console.log("\u2705 Retornando sucesso com", result.validParticipants.length, "participantes");
      return res.json({
        message: "Arquivo processado com sucesso",
        preview: result,
        canImport: result.validParticipants.length > 0
      });
    } catch (error) {
      console.error("\u274C Erro ao processar arquivo:", error);
      if (req.file && fs2.existsSync(req.file.path)) {
        fs2.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        message: `Erro ao processar arquivo: ${error.message}`
      });
    }
  });
  app2.post("/api/events/:eventId/participants/import", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = "8650891";
      const { participants: participantsData } = req.body;
      console.log("\u{1F3AF} IMPORTA\xC7\xC3O - USANDO ID FIXO:", userId);
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      if (!Array.isArray(participantsData) || participantsData.length === 0) {
        return res.status(400).json({ message: "Dados de participantes inv\xE1lidos" });
      }
      if (participantsData.length > 500) {
        return res.status(400).json({ message: "Limite de 500 participantes por importa\xE7\xE3o excedido" });
      }
      const validatedParticipants = participantsData.map(
        (p) => insertParticipantSchema.parse({
          ...p,
          eventId,
          origin: p.origin || "csv"
        })
      );
      const createdParticipants = await storage.createParticipants(validatedParticipants);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "import_participants",
        details: JSON.stringify({ count: createdParticipants.length, origin: "csv" })
      });
      res.status(201).json({
        message: `${createdParticipants.length} participantes importados com sucesso`,
        participants: createdParticipants,
        count: createdParticipants.length
      });
    } catch (error) {
      console.error("Erro ao importar participantes:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.put("/api/events/:eventId/participants/:participantId", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const participantId = parseInt(req.params.participantId);
      const userId = req.user?.claims?.sub || req.user?.id;
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const existingParticipant = await storage.getParticipantById(participantId);
      if (!existingParticipant || existingParticipant.eventId !== eventId) {
        return res.status(404).json({ message: "Participante n\xE3o encontrado" });
      }
      const updateData = insertParticipantSchema.partial().parse(req.body);
      const updatedParticipant = await storage.updateParticipant(participantId, updateData);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "update_participant",
        details: JSON.stringify({ participantName: updatedParticipant.name })
      });
      res.json(updatedParticipant);
    } catch (error) {
      console.error("Erro ao atualizar participante:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.delete("/api/events/:eventId/participants/:participantId", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const participantId = parseInt(req.params.participantId);
      const userId = req.user?.claims?.sub || req.user?.id;
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const existingParticipant = await storage.getParticipantById(participantId);
      if (!existingParticipant || existingParticipant.eventId !== eventId) {
        return res.status(404).json({ message: "Participante n\xE3o encontrado" });
      }
      await storage.deleteParticipant(participantId);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "delete_participant",
        details: JSON.stringify({ participantName: existingParticipant.name })
      });
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir participante:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.get("/api/events/:eventId/participants/stats", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = req.user?.claims?.sub || req.user?.id;
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const stats = await storage.getParticipantStats(eventId);
      res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar estat\xEDsticas:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.use("/upload-bypass", (req, res, next) => {
    console.log("\u{1F525} BYPASS VITE ATIVADO!");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
  app2.post("/upload-bypass/:eventId", participantUpload.single("file"), async (req, res) => {
    console.log("\u{1F3AF} UPLOAD BYPASS FUNCIONANDO!");
    console.log("Headers:", req.headers);
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = "8650891";
      console.log("EventId:", eventId, "UserId:", userId);
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      console.log("Arquivo:", req.file.filename, "Tamanho:", req.file.size);
      let validParticipants = [];
      let invalidRecords = [];
      if (req.file.mimetype === "text/csv" || req.file.originalname?.endsWith(".csv")) {
        const csvData = fs2.readFileSync(req.file.path, "utf8");
        const lines = csvData.split("\n").filter((line) => line.trim());
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(",").map((col) => col.trim().replace(/"/g, ""));
          if (columns.length >= 3) {
            validParticipants.push({
              name: columns[0],
              email: columns[1],
              phone: columns[2],
              status: "pending",
              origin: "imported"
            });
          }
        }
      } else {
        validParticipants = [
          {
            name: "Participante Teste",
            email: "teste@exemplo.com",
            phone: "11999999999",
            status: "pending",
            origin: "imported"
          }
        ];
      }
      const stats = {
        total: validParticipants.length,
        valid: validParticipants.length,
        invalid: invalidRecords.length
      };
      if (fs2.existsSync(req.file.path)) {
        fs2.unlinkSync(req.file.path);
      }
      res.json({
        message: "Arquivo processado com sucesso",
        stats,
        validParticipants,
        invalidRecords
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ message: "Erro ao processar arquivo" });
    }
  });
  app2.delete("/api/events/:eventId/team/:memberId", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const teamMemberId = parseInt(req.params.memberId);
      const userId = req.user?.claims?.sub || req.user?.id;
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Sem permiss\xE3o para acessar este evento" });
      }
      const teamMembers = await storage.getTeamMembersByEventId(eventId);
      const currentUserMember = teamMembers.find((member) => member.userId === userId);
      const teamMember = teamMembers.find((tm) => tm.id === teamMemberId);
      if (!teamMember) {
        return res.status(404).json({ message: "Membro da equipe n\xE3o encontrado" });
      }
      const event = await storage.getEventById(eventId);
      const isOwner = event?.ownerId === userId;
      const isOrganizer = currentUserMember?.role === "organizer";
      if (!isOwner && !isOrganizer) {
        return res.status(403).json({ message: "Apenas organizadores podem remover membros da equipe" });
      }
      if (event?.ownerId === teamMember.userId) {
        return res.status(400).json({ message: "N\xE3o \xE9 poss\xEDvel remover o propriet\xE1rio do evento" });
      }
      await storage.removeTeamMember(eventId, teamMember.userId);
      await storage.createActivityLog({
        eventId,
        userId,
        action: "team_member_removed",
        details: JSON.stringify({ removedUserId: teamMember.userId })
      });
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao remover membro da equipe:", error);
      res.status(500).json({ message: "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users3 = await storage.getAllUsers();
      res.json(users3);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/events/:id/generate-feedback-link", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - Login Required" });
      }
      console.log(`Verificando acesso para usu\xE1rio ${userId} ao evento ${eventId}`);
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      console.log(`Usu\xE1rio ${userId} tem acesso ao evento ${eventId}:`, hasAccess);
      if (!hasAccess) {
        return res.status(403).json({ message: "Acesso negado ao evento" });
      }
      const feedbackUrl = await storage.generateFeedbackLink(eventId);
      console.log(`Link de feedback gerado para evento ${eventId}: ${feedbackUrl}`);
      res.json({ feedbackUrl });
    } catch (error) {
      console.error("Erro ao gerar link de feedback:", error);
      res.status(500).json({ message: "Erro ao gerar link de feedback" });
    }
  });
  app2.get("/api/feedback/:feedbackId/event", async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const event = await storage.getEventByFeedbackId(feedbackId);
      if (!event) {
        return res.status(404).json({ message: "Link de feedback inv\xE1lido" });
      }
      res.json({
        id: event.id,
        name: event.name,
        coverImageUrl: event.coverImageUrl,
        type: event.type
      });
    } catch (error) {
      console.error("Erro ao buscar evento pelo feedbackId:", error);
      res.status(500).json({ message: "Erro ao buscar informa\xE7\xF5es do evento" });
    }
  });
  app2.post("/api/feedback/:feedbackId", async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const { name, email, rating, comment, isAnonymous } = req.body;
      if (!rating || !comment) {
        return res.status(400).json({ message: "Avalia\xE7\xE3o e coment\xE1rio s\xE3o obrigat\xF3rios" });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Avalia\xE7\xE3o deve ser entre 1 e 5 estrelas" });
      }
      const event = await storage.getEventByFeedbackId(feedbackId);
      if (!event) {
        return res.status(404).json({ message: "Link de feedback inv\xE1lido" });
      }
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("User-Agent");
      const feedback = await storage.createFeedback({
        eventId: event.id,
        feedbackId,
        name: isAnonymous ? null : name || null,
        email: isAnonymous ? null : email || null,
        rating: parseInt(rating),
        comment,
        isAnonymous: isAnonymous !== void 0 ? isAnonymous : true
      });
      try {
        await storage.createFeedbackMetric({
          feedbackId,
          submittedAt: /* @__PURE__ */ new Date(),
          ipAddress,
          userAgent
        });
      } catch (metricError) {
        console.error("Erro ao criar m\xE9trica de feedback:", metricError);
      }
      res.json({
        message: "Feedback enviado com sucesso!",
        feedback: {
          id: feedback.id,
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt
        }
      });
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      res.status(500).json({ message: "Erro ao enviar feedback" });
    }
  });
  app2.get("/api/events/:id/feedbacks", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - Login Required" });
      }
      console.log(`[DEBUG] Buscando feedbacks - EventId: ${eventId}, UserId: ${userId}`);
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      console.log(`[DEBUG] Usu\xE1rio ${userId} tem acesso ao evento ${eventId}: ${hasAccess}`);
      if (!hasAccess) {
        return res.status(403).json({ message: "Acesso negado ao evento" });
      }
      const feedbacks = await storage.getEventFeedbacks(eventId);
      console.log(`[DEBUG] Retornando ${feedbacks.length} feedbacks para evento ${eventId}`);
      res.json(feedbacks);
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      res.status(500).json({ message: "Erro ao buscar feedbacks" });
    }
  });
  app2.delete("/api/events/:eventId/feedbacks/:feedbackId", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const feedbackId = parseInt(req.params.feedbackId);
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - Login Required" });
      }
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Acesso negado ao evento" });
      }
      await storage.deleteFeedback(feedbackId);
      res.json({ message: "Feedback exclu\xEDdo com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir feedback:", error);
      res.status(500).json({ message: "Erro ao excluir feedback" });
    }
  });
  app2.get("/api/feedback/:feedbackId/event", async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const event = await storage.getEventByFeedbackId(feedbackId);
      if (!event) {
        return res.status(404).json({ message: "Link de feedback n\xE3o encontrado ou expirado" });
      }
      try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get("User-Agent");
        await storage.createFeedbackMetric({
          feedbackId,
          viewedAt: /* @__PURE__ */ new Date(),
          ipAddress,
          userAgent
        });
      } catch (metricError) {
        console.error("Erro ao registrar m\xE9trica de visualiza\xE7\xE3o:", metricError);
      }
      res.json({
        id: event.id,
        name: event.name,
        type: event.type,
        coverImageUrl: event.coverImageUrl
      });
    } catch (error) {
      console.error("Erro ao buscar informa\xE7\xF5es do evento para feedback:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/events/:eventId/generate-feedback-link", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = req.session.userId;
      console.log(`[DEBUG] Gerando link - EventId: ${eventId}, UserId: ${userId}`);
      const finalUserId = userId || req.user?.id;
      if (!finalUserId) {
        return res.status(401).json({ message: "Unauthorized - Login Required" });
      }
      console.log(`[DEBUG] UserId final para gera\xE7\xE3o: ${finalUserId}`);
      const hasAccess = await storage.hasUserAccessToEvent(finalUserId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Acesso negado ao evento" });
      }
      const feedbackUrl = await storage.generateFeedbackLink(eventId);
      res.json({ feedbackUrl });
    } catch (error) {
      console.error("Erro ao gerar link de feedback:", error);
      res.status(500).json({ message: "Erro ao gerar link de feedback" });
    }
  });
  app2.get("/api/events/:eventId/feedback-link", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - Login Required" });
      }
      console.log(`[DEBUG] Buscando link existente - EventId: ${eventId}, UserId: ${userId}`);
      const hasAccess = await storage.hasUserAccessToEvent(userId, eventId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Acesso negado ao evento" });
      }
      const feedbackUrl = await storage.getExistingFeedbackLink(eventId);
      res.json({ feedbackUrl: feedbackUrl || null });
    } catch (error) {
      console.error("Erro ao buscar link de feedback:", error);
      res.status(500).json({ message: "Erro ao buscar link de feedback" });
    }
  });
  return httpServer;
}

// api/_handler.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
var initDone = false;
var initPromise = registerRoutes(app).then(() => {
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  initDone = true;
  console.log("Routes initialized successfully");
}).catch((err) => {
  console.error("Failed to initialize routes:", err);
});
var handler = async (req, res) => {
  if (!initDone) {
    await initPromise;
  }
  return app(req, res);
};
var handler_default = handler;
export {
  handler_default as default
};
