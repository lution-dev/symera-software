
import 'dotenv/config';
import { db } from './server/db';
import { users, events, tasks, eventTeamMembers, taskAssignees } from './shared/schema';
import * as fs from 'fs';

async function checkDatabase() {
    const allUsers = await db.select().from(users);
    const allEvents = await db.select().from(events);
    const allETM = await db.select().from(eventTeamMembers);

    const report = {
        users: allUsers.map(u => ({ id: u.id, email: u.email })),
        events: allEvents.map(e => ({ id: e.id, name: e.name, ownerId: e.ownerId })),
        teamMembers: allETM.map(m => ({ eventId: m.eventId, userId: m.userId }))
    };

    fs.writeFileSync('db_report.json', JSON.stringify(report, null, 2));
    console.log('Report written to db_report.json');
    process.exit(0);
}

checkDatabase().catch(err => {
    console.error(err);
    process.exit(1);
});
