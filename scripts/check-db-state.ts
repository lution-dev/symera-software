import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    const client = await pool.connect();
    try {
        // 1. User with applution email - show ALL columns
        const usersResult = await client.query(
            "SELECT * FROM users WHERE email = 'applution@gmail.com'"
        );
        console.log('\n=== USER applution@gmail.com ===');
        for (const row of usersResult.rows) {
            console.log('  id:', JSON.stringify(row.id), '(type:', typeof row.id, ')');
            console.log('  email:', row.email);
            console.log('  first_name:', row.first_name);
        }

        // 2. Events with specific owner_id
        const eventsResult = await client.query(
            "SELECT id, name, owner_id FROM events WHERE owner_id = '32f40f0c-1fe9-4b5b-95b3-7e3380930b07'"
        );
        console.log('\n=== EVENTS owned by UUID 32f40f0c ===');
        console.log('Count:', eventsResult.rows.length);
        for (const row of eventsResult.rows) {
            console.log(`  Event ${row.id}: "${row.name}" owner=${row.owner_id}`);
        }

        // 3. Check column type
        const colInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `);
        console.log('\n=== users.id column type ===');
        console.log(JSON.stringify(colInfo.rows));

        const evColInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'owner_id'
    `);
        console.log('\n=== events.owner_id column type ===');
        console.log(JSON.stringify(evColInfo.rows));

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
