import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function diagnose() {
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);

    try {
        // Get all users
        const usersResult = await pool.query('SELECT id, email, "firstName", "lastName" FROM users ORDER BY id');
        console.log('\n=== ALL USERS ===');
        usersResult.rows.forEach(u => console.log(`  ID: ${u.id} | Email: ${u.email} | Name: ${u.firstName} ${u.lastName}`));

        // Get all events
        const eventsResult = await pool.query('SELECT id, name, "ownerId", status FROM events ORDER BY id');
        console.log('\n=== ALL EVENTS ===');
        eventsResult.rows.forEach(e => console.log(`  Event ID: ${e.id} | Name: ${e.name} | Owner ID: ${e.ownerId} | Status: ${e.status}`));

        // Check for applution user specifically
        const applutionUser = await pool.query("SELECT * FROM users WHERE lower(email) = lower('applution@gmail.com')");
        console.log('\n=== USER applution@gmail.com ===');
        if (applutionUser.rows.length > 0) {
            const u = applutionUser.rows[0];
            console.log(`  Found! ID: ${u.id}`);

            // Check events for this user
            const userEvents = await pool.query('SELECT id, name, "ownerId" FROM events WHERE "ownerId" = $1', [u.id]);
            console.log(`  Events owned by ${u.id}: ${userEvents.rows.length}`);
            userEvents.rows.forEach(e => console.log(`    Event: ${e.name} (ID: ${e.id})`));
        } else {
            console.log('  NOT FOUND in database!');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

diagnose();
