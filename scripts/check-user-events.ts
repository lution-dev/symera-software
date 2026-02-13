import 'dotenv/config';
import { db } from '../server/db';
import { users, events } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function checkUserEvents(email: string) {
    console.log(`Checking data for: ${email}`);

    const userList = await db.select().from(users).where(eq(users.email, email));
    console.log(`Found ${userList.length} user(s) with email ${email}:`);
    userList.forEach(u => {
        console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.firstName} ${u.lastName}`);
    });

    if (userList.length > 0) {
        for (const user of userList) {
            const userEvents = await db.select().from(events).where(eq(events.ownerId, user.id));
            console.log(`Found ${userEvents.length} events owned by user ID ${user.id}:`);
            userEvents.forEach(e => {
                console.log(`  - Event ID: ${e.id}, Name: ${e.name}, Start Date: ${e.startDate}`);
            });
        }
    }

    // Also check if there are events with an ownerId that matches SOME user but not this email
    const allEvents = await db.select().from(events).limit(20);
    console.log('\nSample of events in DB (first 20):');
    allEvents.forEach(e => {
        console.log(`- Event: ${e.name}, OwnerId: ${e.ownerId}`);
    });

    process.exit(0);
}

const targetEmail = 'applution@gmail.com';
checkUserEvents(targetEmail).catch(err => {
    console.error(err);
    process.exit(1);
});
