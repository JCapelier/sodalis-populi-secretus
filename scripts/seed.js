import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  await client.query('TRUNCATE TABLE users, events, event_participants, exclusions, pairings RESTART IDENTITY CASCADE;');

  // Insert users
  const usersResult = await client.query(
    `INSERT INTO users (username, password_hash) VALUES
      ($1, $2),
      ($3, $4),
      ($5, $6),
      ($7, $8),
      ($9, $10),
      ($11, $12)
      RETURNING id`,
    [
      'Anne-Laure', 'password',
      'Claude', 'password',
      'Mara', 'password',
      'Flore', 'password',
      'Zachée', 'password',
      'Renaud', 'password',
    ]
  );

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
