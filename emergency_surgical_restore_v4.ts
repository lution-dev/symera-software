
import 'dotenv/config';
import { db } from './server/db';
import { users, events, eventTeamMembers } from './shared/schema';
import { eq, and, inArray, ne } from 'drizzle-orm';
import * as fs from 'fs';

async function restore() {
    console.log('--- STARTING ROBUST SURGICAL RESTORATION V4 ---');

    const sqlContent = fs.readFileSync('supabase-data-import-final.sql', 'utf8');
    const HIJACKER_ID = '8650891';
    const DISPLACED_UUID = '32f40f0c-1fe9-4b5b-95b3-7ee3380930b07';

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
    }
    console.log('Historical users verified.');

    // 2. Identify and Preserve modern users (like the displaced UUID)
    // We already saw it in the DB, so we just need to make sure we don't conflict with it.

    // 3. LEGACY RESTORATION (Events 5-12)
    const legacyEventIds = [5, 6, 7, 8, 9, 10, 11, 12];
    console.log('Restoring legacy ownership and teams...');
    for (const id of legacyEventIds) {
        // Ownership back to HIJACKER_ID (as per SQL truth)
        await db.update(events).set({ ownerId: HIJACKER_ID }).where(eq(events.id, id));

        // Wipe and Restore Team from SQL
        await db.delete(eventTeamMembers).where(eq(eventTeamMembers.eventId, id));
    }

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
        }
    }

    // 4. MODERN RESTORATION (Events 15, 16, 18, 19)
    // These specifically belong to the UUID account or were created as tests
    console.log('Handling modern events...');
    const existingUUID = await db.select().from(users).where(eq(users.id, DISPLACED_UUID));
    if (existingUUID.length > 0) {
        // Restore ownership to the UUID for the modern events
        for (const id of [15, 16]) {
            await db.update(events).set({ ownerId: DISPLACED_UUID }).where(eq(events.id, id));
            await db.insert(eventTeamMembers).values({
                eventId: id,
                userId: DISPLACED_UUID,
                role: 'organizer',
                permissions: { canEdit: true, canDelete: true, canInvite: true }
            }).onConflictDoNothing();
        }
        console.log('Modern events 15 & 16 restored to UUID account.');
    } else {
        console.log('WARNING: UUID account not found, skipping modern event restoration.');
    }

    // 5. Cleanup Hijacker account
    // If hijacker account has events that are NOT the ones above, they stay there.

    console.log('--- RESTORATION V4 COMPLETE ---');
    process.exit(0);
}

restore().catch(console.error);
