import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const result = await pool.query('SELECT * FROM tasks WHERE title = $1 ORDER BY id ASC', ['Preparar materiais do evento']);
  console.log('Tasks with title Preparar materiais do evento:');
  console.log(result.rows);
  
  // try deleting the first one gracefully
  if (result.rows.length > 0) {
    const firstId = result.rows[0].id;
    console.log(`Trying to delete first occurrence with ID ${firstId}...`);
    try {
      await pool.query('BEGIN');
      await pool.query('DELETE FROM task_assignees WHERE task_id = $1', [firstId]);
      await pool.query('DELETE FROM tasks WHERE id = $1', [firstId]);
      await pool.query('ROLLBACK'); // just testing!
      console.log('Delete test SUCCESSFUL (Rolled back so no data was harmed)');
    } catch (e) {
      console.error('DELETE FAILED:', e);
    }
  }
  
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
