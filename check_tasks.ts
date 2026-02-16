
import 'dotenv/config';
import { db } from './server/db';
import { tasks, events } from './shared/schema';
import { eq, isNull } from 'drizzle-orm';

async function checkTasks() {
    console.log('Checking tasks...');
    const allTasks = await db.select().from(tasks);
    console.log(`Found ${allTasks.length} tasks.`);

    const tasksWithoutEvent = allTasks.filter(t => !t.eventId);
    console.log(`Tasks with falsy eventId: ${tasksWithoutEvent.length}`);

    tasksWithoutEvent.forEach(t => {
        console.log(`Task ${t.id}: ${t.title}, eventId: ${t.eventId}`);
    });

    // Check for orphan tasks (eventId points to non-existent event)
    const allEvents = await db.select().from(events);
    const eventIds = new Set(allEvents.map(e => e.id));

    const orphanTasks = allTasks.filter(t => !eventIds.has(t.eventId));
    console.log(`Orphan tasks (eventId not in events table): ${orphanTasks.length}`);

    orphanTasks.forEach(t => {
        console.log(`Task ${t.id}: ${t.title}, eventId: ${t.eventId}`);
    });

    process.exit(0);
}

checkTasks().catch(console.error);
