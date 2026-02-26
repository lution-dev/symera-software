import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    const { data: events, error } = await supabase
        .from('events')
        .select('id, name, status, start_date')
        .eq('owner_id', '8650891');

    if (error) {
        console.error('Error finding events:', error);
        return;
    }

    const activeEvents = events.filter(event =>
        event.status === "planning" ||
        event.status === "confirmed" ||
        event.status === "in_progress" ||
        event.status === "active"
    );

    console.log(`\nActive according to dashboard logic: ${activeEvents.length}`);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    console.log(`Current Threshold (30 days ago): ${thirtyDaysAgo.toISOString()}`);
    for (const event of activeEvents) {
        const eventDate = new Date(event.start_date || "2099-12-31");
        const isVisible = eventDate >= thirtyDaysAgo;
        console.log(`- [${isVisible ? 'VISIBLE' : 'HIDDEN '}] ID: ${event.id} | Date: ${event.start_date} | Name: ${event.name}`);
    }
}

check();
