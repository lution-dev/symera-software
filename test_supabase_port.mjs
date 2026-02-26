import 'dotenv/config';
import pg from 'pg';

async function testPort(port) {
    try {
        const url = new URL(process.env.DATABASE_URL);
        url.port = port;
        const pool = new pg.Pool({ connectionString: url.toString() });

        console.log(`Testing port ${port}...`);
        const start = Date.now();
        await pool.query('SELECT 1');
        console.log(`Success on port ${port} in ${Date.now() - start}ms!`);
        pool.end();
    } catch (e) {
        console.log(`Failed on port ${port}:`, e.message);
    }
}

async function main() {
    await testPort('6543');
    // Then we will also check if we need to format the PgBouncer/Supavisor pool mode
}
main();
