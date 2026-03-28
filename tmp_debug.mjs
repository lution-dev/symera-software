import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC LIMIT 20');
  console.log('Last 20 tasks:', result.rows);
  
  // also group by title to see duplicates
  const dupes = await pool.query('SELECT title, COUNT(*), max(id) as  maxid, min(id) as minid FROM tasks GROUP BY title HAVING COUNT(*) > 1');
  console.log('Duplicates:', dupes.rows);
  
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
