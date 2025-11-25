import { Event, EventInfo, Exclusion, Participant } from "@/type";
import { Pool, QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
});

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
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

  // Collect all unique user and child IDs needed (participants + exclusions)
  const userIds = new Set<number>();
  const childIds = new Set<number>();
  participants.forEach(p => {
    if (p.type === 'user') userIds.add(p.invitee_id);
    else if (p.type === 'child') childIds.add(p.invitee_id);
  });
  exclusions.forEach(e => {
    if (e.invitee_type === 'user') userIds.add(e.invitee_id);
    else if (e.invitee_type === 'child') childIds.add(e.invitee_id);
    if (e.excluded_invitee_type === 'user') userIds.add(e.excluded_invitee_id);
    else if (e.excluded_invitee_type === 'child') childIds.add(e.excluded_invitee_id);
  });

  // Fetch all usernames in one query for users
  const userMap = new Map<number, string>();
  if (userIds.size > 0) {
    const userIdList = Array.from(userIds);
    const usersResult = await query<{ id: number; username: string }>(
      `SELECT id, username FROM users WHERE id = ANY($1)`,
      [userIdList]
    );
    usersResult.rows.forEach(u => userMap.set(u.id, u.username));
  }

  // Fetch all usernames in one query for children
  const childMap = new Map<number, string>();
  if (childIds.size > 0) {
    const childIdList = Array.from(childIds);
    const childrenResult = await query<{ id: number; username: string }>(
      `SELECT id, username FROM children WHERE id = ANY($1)`,
      [childIdList]
    );
    childrenResult.rows.forEach(c => childMap.set(c.id, c.username));
  }

  // Attach usernames to participants
  const participantsWithNames = participants.map(p => ({
    ...p,
    username:
      p.type === 'user'
        ? userMap.get(p.invitee_id) || String(p.invitee_id)
        : childMap.get(p.invitee_id) || String(p.invitee_id),
  }));

  // Attach usernames to exclusions
  const exclusionsWithNames = exclusions.map(e => ({
    ...e,
    giverUsername:
      e.invitee_type === 'user'
        ? userMap.get(e.invitee_id) || String(e.invitee_id)
        : childMap.get(e.invitee_id) || String(e.invitee_id),
    receiverUsername:
      e.excluded_invitee_type === 'user'
        ? userMap.get(e.excluded_invitee_id) || String(e.excluded_invitee_id)
        : childMap.get(e.excluded_invitee_id) || String(e.excluded_invitee_id),
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
