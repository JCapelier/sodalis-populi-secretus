import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  await client.query('TRUNCATE TABLE users, events, event_participants, exclusions, pairings RESTART IDENTITY CASCADE;');

  // Insert users
  const usersResult = await client.query(
    `INSERT INTO users (email, username, password_hash) VALUES
      ($1, $2, $3),
      ($4, $5, $6),
      ($7, $8, $9),
      ($10, $11, $12),
      ($13, $14, $15),
      ($16, $17, $18),
      ($19, $20, $21)
      RETURNING id`,
    [
      'annelaure@mail.com', 'Anne-Laure', 'password',
      'claude@mail.com', 'Claude', 'password',
      'mara@mail.com', 'Mara', 'password',
      'flore@mail.com', 'Flore', 'password',
      'zachee@mail.com', 'Zachée', 'password',
      'renaud@mail.com', 'Renaud', 'password',
      'esther@mail.com', 'Esther', 'password',
    ]
  );

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
