
import 'dotenv/config';
import { db } from './server/db';
import { users } from './shared/schema';
import { like } from 'drizzle-orm';

async function checkSuspiciousUsers() {
    console.log('--- Verificando base de usuários por anomalias ---');

    // Procurar por usuários com emails de migração ou IDs suspeitos
    const suspicious = await db.select().from(users).where(like(users.email, 'migrated%'));

    if (suspicious.length === 0) {
        console.log('✅ NENHUM usuário em estado de migração encontrado.');
    } else {
        console.warn(`⚠️ ENCONTRADOS ${suspicious.length} usuários em estado suspeito:`);
        suspicious.forEach(u => console.log(`- ID: ${u.id}, Email: ${u.email}`));
    }

    console.log('--- Verificação concluída ---');
    process.exit(0);
}

checkSuspiciousUsers().catch(console.error);
