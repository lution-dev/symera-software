import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    console.log('Fetching all users to check for duplicates...');

    // Fetch all users to bypass exact matching issues
    const { data: users, error } = await supabase.from('users').select('id, email, first_name');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const target = 'applution@gmail.com'.toLowerCase();
    const matches = users.filter(u => u.email && u.email.toLowerCase() === target);

    console.log(`\nFound ${matches.length} users matching ${target}:`);
    for (const m of matches) {
        console.log(`- ID: ${m.id} | Email: ${m.email} | First Name: ${m.first_name}`);

        // Check events for this ID
        const { data: events } = await supabase.from('events').select('id, name').eq('owner_id', m.id);
        console.log(`  Events: ${events?.length || 0}`);
    }
}

check();
