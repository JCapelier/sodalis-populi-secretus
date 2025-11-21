import { Event, EventInfo, Exclusion, Participant } from "@/type";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
});

export async function query<T = unknown>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  return pool.query<T>(text, params);
}

export async function getEventInfo(event: Event): Promise<EventInfo & {
  participants: Participant[];
  exclusions: (Exclusion & { giverUsername: string; receiverUsername: string })[];
}> {
  // Fetch all participants for the event (with user_id)
  const participants = await getEventParticipants(event.id);

  // Fetch all exclusions for the event (with user_id, excluded_user_id)
  const exclusions = await getEventExclusions(event.id);

  // Collect all unique user IDs needed (participants + exclusions)
  const userIds = new Set<number>();
  participants.forEach(p => userIds.add(p.user_id));
  exclusions.forEach(e => {
    userIds.add(e.user_id);
    userIds.add(e.excluded_user_id);
  });

  // Fetch all usernames in one query
  const userIdList = Array.from(userIds);
  const usersResult = await query<{ id: number; username: string }>(
    `SELECT id, username FROM users WHERE id = ANY($1)`,
    [userIdList]
  );
  const userMap = new Map<number, string>();
  usersResult.rows.forEach(u => userMap.set(u.id, u.username));

  // Attach usernames to participants
  const participantsWithNames = participants.map(p => ({
    ...p,
    username: userMap.get(p.user_id) || String(p.user_id),
  }));

  // Attach usernames to exclusions
  const exclusionsWithNames = exclusions.map(e => ({
    ...e,
    giverUsername: userMap.get(e.user_id) || String(e.user_id),
    receiverUsername: userMap.get(e.excluded_user_id) || String(e.excluded_user_id),
  }));

  // Get admin username
  const adminUsername = userMap.get(event.admin_id) || (await getAdminUsername(event.admin_id));

  return {
    ...event,
    adminUsername,
    participants: participantsWithNames,
    exclusions: exclusionsWithNames,
  };
}

export async function getAdminUsername(admin_id: number): Promise<string> {
  const result = await query<{ username: string }>(`SELECT username FROM users WHERE id = $1`, [admin_id]);
  return result.rows[0].username;
}

export async function getEventParticipants(event_id: number): Promise<Participant[]>{
  const result = await query<Participant>(`SELECT * FROM event_participants WHERE event_id = $1`, [event_id]);
  return result.rows;
}

export async function getNameFromId(user_id: number): Promise<string> {
  const result = await query<{username: string}>(`SELECT username FROM users WHERE id = $1`, [user_id]);
  return result.rows[0].username;
}

export async function getEventExclusions(event_id: number): Promise<Exclusion[]> {
  const result = await query<Exclusion>(`SELECT * FROM exclusions WHERE event_id = $1`, [event_id]);
  return result.rows;
}
