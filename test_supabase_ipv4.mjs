import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import pg from 'pg';

async function testPort(port) {
    try {
        const url = new URL(process.env.DATABASE_URL);
        url.port = port;
        const pool = new pg.Pool({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });

        console.log(`Testing Supabase on port ${port} forcing IPv4...`);
        const start = Date.now();
        await pool.query('SELECT 1');
        console.log(`Success on port ${port} in ${Date.now() - start}ms!`);
        pool.end();
    } catch (e) {
        console.log(`Failed on port ${port}:`, e.message);
    }
}

async function main() {
    await testPort('5432');
    await testPort('6543');
}
main();
