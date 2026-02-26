import 'dotenv/config';
import { storage } from './server/storage';

async function testApiLogic() {
    const email = 'applution@gmail.com';

    // 1. Get user by email
    const user = await storage.getUserByEmail(email);
    console.log('User found by email:', user ? user.id : 'NOT FOUND');

    if (!user) return process.exit(1);

    // 2. getEventsByUser
    const events = await storage.getEventsByUser(user.id);
    console.log(`getEventsByUser(${user.id}) returned ${events.length} events`);

    // 3. getActiveEvents
    const activeEvents = events.filter(event =>
        event.status === "planning" ||
        event.status === "confirmed" ||
        event.status === "in_progress" ||
        event.status === "active"
    );
    console.log(`Active events (filtered by status): ${activeEvents.length}`);

    // Print all events found
    if (events.length > 0) {
        events.forEach(e => console.log(` - ID: ${e.id} | Name: ${e.name} | Status: ${e.status}`));
    } else {
        // Check manually
        const { db } = await import('./server/db');
        const { events: eventsTable } = await import('@shared/schema');
        const { eq } = await import('drizzle-orm');
        const rawEvents = await db.select().from(eventsTable).where(eq(eventsTable.ownerId, user.id));
        console.log(`Raw events query returned ${rawEvents.length} events:`);
        rawEvents.forEach(e => console.log(`RAW - ID: ${e.id} | Name: ${e.name} | Status: ${e.status}`));
    }

    process.exit(0);
}

testApiLogic();
