import 'dotenv/config';
import pg from 'pg';
import dns from 'dns';

// Fix connection timeouts by forcing IPv4
dns.setDefaultResultOrder('ipv4first');

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function diagnose() {
    console.log('Connecting to database...');

    try {
        const targetEmail = 'applution@gmail.com';

        console.log(`\n=== Finding users for email ${targetEmail} ===`);
        const usersResult = await pool.query('SELECT id, email, "firstName" FROM users WHERE lower(email) = lower($1)', [targetEmail]);

        if (usersResult.rows.length === 0) {
            console.log('No user found with this email!');
        } else {
            for (const u of usersResult.rows) {
                console.log(`Found USER: ID=${u.id} Email=${u.email}`);

                const eventsResult = await pool.query('SELECT id, name, "ownerId" FROM events WHERE "ownerId" = $1', [u.id]);
                console.log(`  -> Owned Events: ${eventsResult.rows.length}`);
                for (const e of eventsResult.rows) {
                    console.log(`     - [${e.id}] ${e.name}`);
                }
            }
        }

        console.log('\n=== Recent Events (any owner) ===');
        const allEvents = await pool.query('SELECT id, name, "ownerId" FROM events ORDER BY "createdAt" DESC LIMIT 10');
        for (const e of allEvents.rows) {
            console.log(`- [${e.id}] ${e.name} (Owner: ${e.ownerId})`);
        }

        console.log('\n=== Checking if any events exist for Dev ID (8650891) ===');
        const devEvents = await pool.query('SELECT id, name FROM events WHERE "ownerId" = $1', ['8650891']);
        console.log(`Dev events found: ${devEvents.rows.length}`);
        for (const e of devEvents.rows) {
            console.log(`- [${e.id}] ${e.name}`);
        }

    } catch (err) {
        console.error('Database query failed:', err.message);
    } finally {
        await pool.end();
    }
}

diagnose();
