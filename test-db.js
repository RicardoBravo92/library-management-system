import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: "postgresql://postgres:prisma@127.0.0.1:5432/postgres"
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected successfully:', res.rows[0]);
  }
  pool.end();
});
