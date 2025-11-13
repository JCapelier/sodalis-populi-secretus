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
  const userIds = usersResult.rows.map(row => row.id);

  // Insert events
  const eventsResult = await client.query(
    `INSERT INTO events (name, admin_id, status, price_limit_cents) VALUES
      ($1, $2, $3, $4),
      ($5, $6, $7, $8),
      ($9, $10, $11, $12)
      RETURNING id`,
    [
      'Secret Santa 2025', userIds[0], 'pending', 2000,
      'Birthday Bash', userIds[1], 'pending', 3000,
      'New Year Party', userIds[2], 'pending', 2500,
    ]
  );
  const eventIds = eventsResult.rows.map(row => row.id);

  // Insert event participants (example: 2 per event)
  await client.query(
    `INSERT INTO event_participants (event_id, user_id, display_name, email) VALUES
      ($1, $2, $3, $4),
      ($5, $6, $7, $8),
      ($9, $10, $11, $12),
      ($13, $14, $15, $16),
      ($17, $18, $19, $20),
      ($21, $22, $23, $24)`,
    [
      eventIds[0], userIds[0], 'Anne-Laure', 'annelaure@mail.com',
      eventIds[0], userIds[1], 'Claude', 'claude@mail.com',
      eventIds[1], userIds[2], 'Mara', 'mara@mail.com',
      eventIds[1], userIds[3], 'Flore', 'flore@mail.com',
      eventIds[2], userIds[4], 'Zachée', 'zachee@mail.com',
      eventIds[2], userIds[5], 'Renaud', 'renaud@mail.com',
    ]
  );

  await client.end();
  console.log('Seed data inserted successfully.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
