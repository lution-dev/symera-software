
import 'dotenv/config';
import { db } from './server/db';
import { events, users } from './shared/schema';

async function listAllEvents() {
    const allEvents = await db.select().from(events);
    const allUsers = await db.select().from(users);

    console.log('--- ALL EVENTS ---');
    allEvents.forEach(e => console.log(`ID: ${e.id}, Name: ${e.name}, OwnerId: ${e.ownerId}`));

    console.log('--- ALL USERS ---');
    allUsers.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}`));

    process.exit(0);
}

listAllEvents().catch(console.error);
