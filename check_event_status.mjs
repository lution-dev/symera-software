import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    console.log('Querying Supabase REST API to check event status...');

    // Get events for applution
    const { data: events, error } = await supabase
        .from('events')
        .select('id, name, status, owner_id')
        .eq('owner_id', '8650891');

    if (error) {
        console.error('Error finding events:', error);
        return;
    }

    console.log(`Found ${events.length} events for 8650891.`);
    for (const e of events) {
        console.log(`- ID: ${e.id} | Name: ${e.name} | Status: "${e.status}"`);
    }

    // Count active events exactly as dashboard does
    const activeEvents = events.filter(event =>
        event.status === "planning" ||
        event.status === "confirmed" ||
        event.status === "in_progress" ||
        event.status === "active"
    );

    console.log(`\nActive according to dashboard logic: ${activeEvents.length}`);
}

check();
