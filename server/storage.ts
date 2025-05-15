import {
  users,
  events,
  tasks,
  eventTeamMembers,
  vendors,
  activityLogs,
  type User,
  type Event,
  type Task,
  type EventTeamMember,
  type Vendor,
  type ActivityLog,
  type UpsertUser,
  type InsertEvent,
  type InsertTask,
  type InsertEventTeamMember,
  type InsertVendor,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

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
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Team member operations
  getTeamMembersByEventId(eventId: number): Promise<(EventTeamMember & { user: User })[]>;
  addTeamMember(teamMember: InsertEventTeamMember): Promise<EventTeamMember>;
  removeTeamMember(eventId: number, userId: string): Promise<void>;
  isUserTeamMember(userId: string, eventId: number): Promise<boolean>;
  hasUserAccessToEvent(userId: string, eventId: number): Promise<boolean>;
  
  // Vendor operations
  getVendorsByEventId(eventId: number): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: number): Promise<void>;
  
  // Activity log operations
  getActivityLogsByEventId(eventId: number): Promise<ActivityLog[]>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
    return user;
  }

  async findOrCreateUserByEmail(email: string): Promise<User> {
    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUsers.length > 0) {
      return existingUsers[0];
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
    
    return newUser;
  }

  // Event operations
  async getEventsByUser(userId: string): Promise<Event[]> {
    // Get events where user is owner
    const ownedEvents = await db
      .select()
      .from(events)
      .where(eq(events.ownerId, userId))
      .orderBy(desc(events.date));
    
    // Get events where user is team member
    const teamMemberships = await db
      .select({
        eventId: eventTeamMembers.eventId,
      })
      .from(eventTeamMembers)
      .where(eq(eventTeamMembers.userId, userId));
    
    const teamEventIds = teamMemberships.map(tm => tm.eventId);
    
    if (teamEventIds.length === 0) {
      return ownedEvents;
    }
    
    // Get team events
    const teamEvents = await Promise.all(
      teamEventIds.map(async (eventId) => {
        const [event] = await db
          .select()
          .from(events)
          .where(eq(events.id, eventId));
        return event;
      })
    );
    
    // Combine owned and team events, removing duplicates
    const allEvents = [...ownedEvents];
    for (const event of teamEvents) {
      if (event && !allEvents.some(e => e.id === event.id)) {
        allEvents.push(event);
      }
    }
    
    // Sort by date
    return allEvents.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({
        ...eventData,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Task operations
  async getTasksByEventId(eventId: number): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.eventId, eventId))
      .orderBy(tasks.dueDate);
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({
        ...taskData,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
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
    const teamMembers = await db
      .select()
      .from(eventTeamMembers)
      .where(
        and(
          eq(eventTeamMembers.eventId, eventId),
          eq(eventTeamMembers.userId, userId)
        )
      );
    
    return teamMembers.length > 0;
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
    return db
      .select()
      .from(vendors)
      .where(eq(vendors.eventId, eventId));
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
}

export const storage = new DatabaseStorage();
