
import 'dotenv/config';
import { db } from './server/db';
import { users, events, eventTeamMembers } from './shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import * as fs from 'fs';

async function restore() {
    console.log('--- STARTING SURGICAL RESTORATION V3 ---');

    const sqlContent = fs.readFileSync('supabase-data-import-final.sql', 'utf8');

    // 1. Restore Users from SQL
    const userMatches = sqlContent.matchAll(/INSERT INTO (?:public\.)?users .*? VALUES \(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*(?:'([^']*)'|NULL)\s*,\s*(?:'([^']*)'|NULL)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g);
    for (const m of userMatches) {
        const userData = {
            id: m[1],
            email: m[2],
            firstName: m[3],
            lastName: m[4],
            phone: m[5] || null,
            profileImageUrl: m[6] || null,
            createdAt: new Date(m[7]),
            updatedAt: new Date(m[8])
        };
        await db.insert(users).values(userData).onConflictDoNothing();
        console.log(`Restored/Verified user: ${userData.id} (${userData.email})`);
    }

    // 2. Clear corrupted team members for legacy events
    const legacyEventIds = [5, 6, 7, 8, 9, 10, 11, 12];
    console.log('Cleaning team members for legacy events...');
    await db.delete(eventTeamMembers).where(inArray(eventTeamMembers.eventId, legacyEventIds));

    // 3. Restore Teams from SQL
    const teamMatches = sqlContent.matchAll(/INSERT INTO (?:public\.)?event_team_members .*? VALUES \(\s*\d+\s*,\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g);
    for (const m of teamMatches) {
        const eventId = parseInt(m[1]);
        if (legacyEventIds.includes(eventId)) {
            const memberData = {
                eventId,
                userId: m[2],
                role: m[3],
                permissions: JSON.parse(m[4])
            };
            await db.insert(eventTeamMembers).values(memberData).onConflictDoNothing();
            console.log(`Restored team member: Event ${eventId} -> User ${memberData.userId}`);
        }
    }

    // 4. Restore Event Ownership (as per SQL)
    console.log('Restoring ownership for legacy events...');
    for (const id of legacyEventIds) {
        await db.update(events).set({ ownerId: '8650891' }).where(eq(events.id, id));
    }

    // 5. Untangle Modern Events (15, 16)
    // Heuristic: Move back to the UUID account that was displaced
    const DISPLACED_UUID = '32f40f0c-1fe9-4b5b-95b3-7ee3380930b07';
    const modernEvents = [15, 16];
    console.log('Restoring modern events to original UUID creator...');
    for (const id of modernEvents) {
        await db.update(events).set({ ownerId: DISPLACED_UUID }).where(eq(events.id, id));
        // Also update team member list for these events (ensuring only the owner is there for now)
        await db.delete(eventTeamMembers).where(eq(eventTeamMembers.eventId, id));
        await db.insert(eventTeamMembers).values({
            eventId: id,
            userId: DISPLACED_UUID,
            role: 'organizer',
            permissions: { canEdit: true, canDelete: true, canInvite: true }
        }).onConflictDoNothing();
    }

    console.log('--- RESTORATION V3 COMPLETE ---');
    process.exit(0);
}

restore().catch(console.error);
