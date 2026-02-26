import 'dotenv/config';
import { db, pool } from './server/db';
import { events, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function diagnose() {
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);

    try {
        const allUsers = await db.select().from(users);
        console.log('\n=== ALL USERS ===');
        allUsers.forEach(u => console.log(`  ID: ${u.id} | Email: ${u.email}`));

        const allEvents = await db.select().from(events);
        console.log('\n=== ALL EVENTS ===');
        allEvents.forEach(e => console.log(`  Event ID: ${e.id} | Name: ${e.name} | Owner ID: ${e.ownerId}`));

        const targetEmail = 'applution@gmail.com';
        const applutionUsers = await db.select().from(users).where(sql`lower(${users.email}) = lower(${targetEmail})`);

        console.log('\n=== USER applution@gmail.com ===');
        if (applutionUsers.length > 0) {
            const u = applutionUsers[0];
            console.log(`  Found in DB! ID: ${u.id}`);

            const userEvents = await db.select().from(events).where(eq(events.ownerId, u.id));
            console.log(`  Events owned by ${u.id}: ${userEvents.length}`);
        } else {
            console.log('  NOT FOUND in database!');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnose();
