import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  varchar,
  boolean,
  jsonb,
  pgEnum,
  index,
  unique,
  real,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  tasks: many(tasks),
}));

// Event Types
export const eventTypeEnum = pgEnum("event_type", [
  "wedding",
  "birthday",
  "corporate",
  "conference",
  "social",
  "other",
]);

// Event Format
export const eventFormatEnum = pgEnum("event_format", [
  "in_person",  // Presencial
  "online",     // Online
  "hybrid",     // Híbrido
]);

// Event Status
export const eventStatusEnum = pgEnum("event_status", [
  "planning",   // Planejamento
  "confirmed",  // Confirmado
  "in_progress", // Em andamento
  "completed",  // Concluído
  "cancelled",  // Cancelado
  "active",     // Legacy status (for compatibility)
]);

// Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: eventTypeEnum("type").notNull(),
  format: eventFormatEnum("format").default("in_person"), // Formato do evento (presencial, online, híbrido)
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location"),
  meetingUrl: text("meeting_url"), // URL para eventos online
  description: text("description"),
  budget: real("budget"),
  expenses: real("expenses").default(0),
  attendees: integer("attendees"),
  coverImageUrl: text("cover_image_url"),
  status: eventStatusEnum("status").default("planning"),
  ownerId: varchar("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  owner: one(users, {
    fields: [events.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  teamMembers: many(eventTeamMembers),
  vendors: many(vendors),
  budgetItems: many(budgetItems),
}));

// Task Status
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "completed",
]);

// Task Priority
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: taskStatusEnum("status").default("todo"),
  priority: taskPriorityEnum("priority").default("medium"),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  assigneeId: varchar("assignee_id").references(() => users.id), // Keep for backward compatibility
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    eventIdIdx: index("tasks_event_id_idx").on(table.eventId),
  }
});

// Task assignees (join table for task-user M-N relationship)
export const taskAssignees = pgTable("task_assignees", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    unq: unique().on(table.taskId, table.userId),
    taskIdIdx: index("task_assignees_task_id_idx").on(table.taskId),
    userIdIdx: index("task_assignees_user_id_idx").on(table.userId),
  }
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  event: one(events, {
    fields: [tasks.eventId],
    references: [events.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  assignees: many(taskAssignees),
  reminders: many(taskReminders),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignees.userId],
    references: [users.id],
  }),
}));

// Task Reminder Channel Type
export const reminderChannelEnum = pgEnum("reminder_channel", [
  "whatsapp",
  "email",
  "sms",
]);

// Task Reminders
export const taskReminders = pgTable("task_reminders", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scheduledTime: timestamp("scheduled_time").notNull(),
  sent: boolean("sent").default(false),
  sentAt: timestamp("sent_at"),
  channel: reminderChannelEnum("channel").default("whatsapp"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    taskIdIdx: index("task_reminders_task_id_idx").on(table.taskId),
    userIdIdx: index("task_reminders_user_id_idx").on(table.userId),
  }
});

export const taskRemindersRelations = relations(taskReminders, ({ one }) => ({
  task: one(tasks, {
    fields: [taskReminders.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskReminders.userId],
    references: [users.id],
  }),
}));

// Team Role
export const teamRoleEnum = pgEnum("team_role", [
  "organizer",
  "team_member",
  "vendor",
]);

// Event team members (join table for event-user M-N relationship)
export const eventTeamMembers = pgTable("event_team_members", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: teamRoleEnum("role").default("team_member"),
  permissions: jsonb("permissions").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    unq: unique().on(table.eventId, table.userId),
    eventIdIdx: index("event_team_members_event_id_idx").on(table.eventId),
    userIdIdx: index("event_team_members_user_id_idx").on(table.userId),
  }
});

export const eventTeamMembersRelations = relations(eventTeamMembers, ({ one }) => ({
  event: one(events, {
    fields: [eventTeamMembers.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventTeamMembers.userId],
    references: [users.id],
  }),
}));

// Vendors
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  service: text("service").notNull(),
  cost: real("cost"),
  notes: text("notes"),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    eventIdIdx: index("vendors_event_id_idx").on(table.eventId),
  }
});

export const vendorsRelations = relations(vendors, ({ one }) => ({
  event: one(events, {
    fields: [vendors.eventId],
    references: [events.id],
  }),
}));

// Activity log
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  details: jsonb("details").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    eventIdIdx: index("activity_logs_event_id_idx").on(table.eventId),
  }
});

// Budget Items
export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  paid: boolean("paid").default(false),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    eventIdIdx: index("budget_items_event_id_idx").on(table.eventId),
  }
});

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  event: one(events, {
    fields: [budgetItems.eventId],
    references: [events.id],
  }),
}));

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  paid: boolean("paid").default(false),
  dueDate: timestamp("due_date"),
  paymentDate: timestamp("payment_date"),
  vendorId: integer("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    eventIdIdx: index("expenses_event_id_idx").on(table.eventId),
    vendorIdIdx: index("expenses_vendor_id_idx").on(table.vendorId),
  }
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  event: one(events, {
    fields: [expenses.eventId],
    references: [events.id],
  }),
  vendor: one(vendors, {
    fields: [expenses.vendorId],
    references: [vendors.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertEventSchema = createInsertSchema(events);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertEventTeamMemberSchema = createInsertSchema(eventTeamMembers);
export const insertVendorSchema = createInsertSchema(vendors);
export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const insertBudgetItemSchema = createInsertSchema(budgetItems);
export const insertExpenseSchema = createInsertSchema(expenses);
export const insertTaskAssigneeSchema = createInsertSchema(taskAssignees);
export const insertTaskReminderSchema = createInsertSchema(taskReminders);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type Event = typeof events.$inferSelect;

export type InsertTask = typeof tasks.$inferInsert;
export type Task = typeof tasks.$inferSelect;

export type InsertTaskAssignee = typeof taskAssignees.$inferInsert;
export type TaskAssignee = typeof taskAssignees.$inferSelect;

export type InsertEventTeamMember = typeof eventTeamMembers.$inferInsert;
export type EventTeamMember = typeof eventTeamMembers.$inferSelect;

export type InsertVendor = typeof vendors.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;

export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type InsertBudgetItem = typeof budgetItems.$inferInsert;
export type BudgetItem = typeof budgetItems.$inferSelect;

export type InsertExpense = typeof expenses.$inferInsert;
export type Expense = typeof expenses.$inferSelect;

export type InsertTaskReminder = typeof taskReminders.$inferInsert;
export type TaskReminder = typeof taskReminders.$inferSelect;

// Event creation schema with validation
export const createEventSchema = z.object({
  name: z.string().min(3, "Nome do evento é obrigatório").max(100),
  type: z.enum(["wedding", "birthday", "corporate", "conference", "social", "other"]),
  format: z.enum(["in_person", "online", "hybrid"]).default("in_person"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  description: z.string().optional(),
  budget: z.number().optional(),
  attendees: z.number().int().optional(),
  coverImageUrl: z.string().optional(),
  generateAIChecklist: z.boolean().default(true),
});

export type CreateEventData = z.infer<typeof createEventSchema>;

// Task creation schema with validation
export const createTaskSchema = z.object({
  title: z.string().min(3, "Título da tarefa é obrigatório"),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
  status: z.enum(["todo", "in_progress", "completed"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  eventId: z.number(),
  assigneeId: z.string().optional(), // Keep for backward compatibility
  assigneeIds: z.array(z.string()).optional(), // New field for multiple assignees
});

export type CreateTaskData = z.infer<typeof createTaskSchema>;
