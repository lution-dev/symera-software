import 'dotenv/config';
import { db } from './server/db';
import { users } from '@shared/schema';

async function verifyDb() {
    console.log('Testing DB connection (should be instant if IPv4 fix worked)...');
    const start = Date.now();
    try {
        const res = await db.select().from(users).limit(1);
        console.log(`Success in ${Date.now() - start}ms! Found users: ${res.length}`);
    } catch (e: any) {
        console.error(`Failed in ${Date.now() - start}ms:`, e.message);
    }
    process.exit();
}
verifyDb();
