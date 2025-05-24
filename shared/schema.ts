import { relations } from 'drizzle-orm';
import { text, integer, pgTable, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  format: text('format').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  location: text('location'),
  meetingUrl: text('meeting_url'),
  description: text('description'),
  budget: integer('budget'),
  expenses: integer('expenses').default(0),
  attendees: integer('attendees'),
  coverImageUrl: text('cover_image_url'),
  status: text('status').default('planning'),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  owner: one(users, {
    fields: [events.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  teamMembers: many(teamMembers),
  activities: many(eventActivities),
  scheduleItems: many(scheduleItems),
}));

export const tasks = pgTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  status: text('status').default('todo').notNull(),
  priority: text('priority').default('medium').notNull(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  assigneeId: text('assignee_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const taskAssignees = pgTable('task_assignees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventActivities = pgTable('event_activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => events.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  details: text('details', { mode: 'json' }).default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const teamMembers = pgTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => events.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(),
  permissions: text('permissions', { mode: 'json' }).default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vendors = pgTable('vendors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  service: text('service').notNull(),
  cost: integer('cost'),
  notes: text('notes'),
  eventId: integer('event_id').references(() => events.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Nova tabela para itens do cronograma
export const scheduleItems = pgTable('schedule_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => events.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: text('start_time').notNull(),
  location: text('location'),
  responsibles: text('responsibles'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const scheduleItemsRelations = relations(scheduleItems, ({ one }) => ({
  event: one(events, {
    fields: [scheduleItems.eventId],
    references: [events.id],
  }),
}));

// Schemas para inserção de dados
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ createdAt: true, updatedAt: true });
export const insertTaskAssigneeSchema = createInsertSchema(taskAssignees).omit({ createdAt: true });
export const insertEventActivitySchema = createInsertSchema(eventActivities).omit({ createdAt: true });
export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ createdAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ createdAt: true, updatedAt: true });
export const insertScheduleItemSchema = createInsertSchema(scheduleItems).omit({ createdAt: true, updatedAt: true });

// Types para inserção
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTaskAssignee = z.infer<typeof insertTaskAssigneeSchema>;
export type InsertEventActivity = z.infer<typeof insertEventActivitySchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertScheduleItem = z.infer<typeof insertScheduleItemSchema>;

// Types para seleção
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskAssignee = typeof taskAssignees.$inferSelect;
export type EventActivity = typeof eventActivities.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type ScheduleItem = typeof scheduleItems.$inferSelect;