
import 'dotenv/config';
import { db } from './server/db';
import { tasks, events } from './shared/schema';
import { eq } from 'drizzle-orm';

async function mockDashboardLogic() {
    console.log("Starting mock dashboard logic...");

    // Mock a user ID - we'll just grab the first user who has events
    const allEvents = await db.select().from(events).limit(1);
    if (allEvents.length === 0) {
        console.log("No events found in DB to test with.");
        return;
    }
    const userId = allEvents[0].ownerId;
    console.log(`Testing with User ID: ${userId}`);

    // 1. Get events for user (simplified: just getting all events for this user)
    const userEvents = await db.select().from(events).where(eq(events.ownerId, userId));
    console.log(`Found ${userEvents.length} events for user.`);

    let pendingTasks: any[] = [];

    for (const event of userEvents) {
        console.log(`Processing event: ${event.name} (ID: ${event.id})`);

        // 2. Get tasks
        const eventTasks = await db.select().from(tasks).where(eq(tasks.eventId, event.id));
        console.log(`  Found ${eventTasks.length} tasks.`);

        // 3. Apply the mapping logic EXACTLY as in routes.ts
        const tasksWithEventName = eventTasks
            .filter(task => task.status !== "completed")
            .map(task => ({
                ...task,
                eventName: event.name
            }));

        if (tasksWithEventName.length > 0) {
            console.log(`  Mapped task 0 eventName: '${tasksWithEventName[0].eventName}'`);
        }

        pendingTasks = pendingTasks.concat(tasksWithEventName);
    }

    console.log("--------------------------------Result--------------------------------");
    console.log(`Total pending tasks: ${pendingTasks.length}`);
    if (pendingTasks.length > 0) {
        console.log("Sample task:", JSON.stringify(pendingTasks[0], null, 2));
        if (pendingTasks[0].eventName) {
            console.log("SUCCESS: eventName is present.");
        } else {
            console.log("FAILURE: eventName is MISSING.");
        }
    } else {
        console.log("No pending tasks found to verify.");
    }

    process.exit(0);
}

mockDashboardLogic().catch(console.error);
