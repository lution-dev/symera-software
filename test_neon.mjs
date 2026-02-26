import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function test() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const res = await sql`SELECT 1`;
        console.log("Success:", res);
    } catch (err) {
        console.error("Fetch failed with details:");
        console.error(err);
        if (err.cause) {
            console.error("Cause:", err.cause);
        }
    }
}
test();
