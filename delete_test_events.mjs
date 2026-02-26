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

async function removeTestEvents() {
    console.log('Connecting to database...');

    try {
        // Primeiro, vamos ver quais eventos vão ser apagados para confirmar
        const checkQuery = await pool.query("SELECT id, name, ownerId FROM events WHERE name ILIKE '%teste%'");

        console.log(`Encontrados ${checkQuery.rowCount} eventos de teste:`);
        for (const row of checkQuery.rows) {
            console.log(`- [ID: ${row.id}] ${row.name} (Dono: ${row.ownerId})`);
        }

        if (checkQuery.rowCount > 0) {
            // Remover referências em outras tabelas primeiro
            // 1. Remover event_team_members
            const deleteTeamQ = await pool.query("DELETE FROM event_team_members WHERE eventId IN (SELECT id FROM events WHERE name ILIKE '%teste%')");
            console.log(`Deletados ${deleteTeamQ.rowCount} membros de equipe dos eventos de teste.`);

            // 2. Remover tarefas associadas
            const deleteTasksQ = await pool.query("DELETE FROM tasks WHERE eventId IN (SELECT id FROM events WHERE name ILIKE '%teste%')");
            console.log(`Deletadas ${deleteTasksQ.rowCount} tarefas associadas aos eventos de teste.`);

            // 3. Remover os eventos
            const deleteEventsQ = await pool.query("DELETE FROM events WHERE name ILIKE '%teste%'");
            console.log(`SUCESSO: ${deleteEventsQ.rowCount} eventos de teste foram apagados definitivamente.`);
        } else {
            console.log('Nenhum evento com a palavra "teste" no nome foi encontrado.');
        }

    } catch (err) {
        console.error('Database error:', err.message);
    } finally {
        await pool.end();
    }
}

removeTestEvents();
