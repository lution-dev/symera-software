import { db } from './server/db';
import { users, events } from './shared/schema';
import { eq } from 'drizzle-orm';

async function fixData() {
  console.log("=== VERIFICANDO USUÁRIOS COM EMAIL applution@gmail.com ===");
  const allUsers = await db.select().from(users);
  
  const applutionUsers = allUsers.filter(u => u.email === 'applution@gmail.com');
  console.log("Usuários com email applution@gmail.com:", JSON.stringify(applutionUsers, null, 2));
  
  console.log("\n=== VERIFICANDO TODOS OS USUÁRIOS ===");
  console.log(allUsers.map(u => ({ id: u.id, email: u.email })));
  
  console.log("\n=== VERIFICANDO EVENTOS ===");
  const allEvents = await db.select({ id: events.id, name: events.name, ownerId: events.ownerId }).from(events);
  console.log(JSON.stringify(allEvents, null, 2));
  
  process.exit(0);
}

fixData().catch(console.error);
