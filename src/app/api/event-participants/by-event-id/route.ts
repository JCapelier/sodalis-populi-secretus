
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { InviteeType } from "@/type";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event-id");

  if (!eventId) {
    return NextResponse.json({ error: "Missing event-id" }, { status: 400 });
  }

  // Fetch all participants for the event
  const fetchParticipantsQuery = `
    SELECT invitee_id, type
    FROM event_participants
    WHERE event_id = $1
  `;
  try {
    const result = await query<{invitee_id: number, type: InviteeType}>(fetchParticipantsQuery, [eventId]);
    const participants = result.rows;
    // Separate user and child IDs
    const userIds = participants.filter(p => p.type === 'user').map(p => p.invitee_id);
    const childIds = participants.filter(p => p.type === 'child').map(p => p.invitee_id);

    // Fetch usernames for users
    const userMap = new Map();
    if (userIds.length > 0) {
      const usersResult = await query<{id: number, username: string}>(`SELECT id, username FROM users WHERE id = ANY($1)`, [userIds]);
      usersResult.rows.forEach(u => userMap.set(u.id, u.username));
    }
    // Fetch usernames for children
    const childMap = new Map();
    if (childIds.length > 0) {
      const childrenResult = await query<{id: number, username: string}>(`SELECT id, username FROM children WHERE id = ANY($1)`, [childIds]);
      childrenResult.rows.forEach(c => childMap.set(c.id, c.username));
    }

    // Attach usernames
    const participantsWithNames = participants.map(p => ({
      invitee_id: p.invitee_id,
      type: p.type,
      username: p.type === 'user' ? userMap.get(p.invitee_id) || String(p.invitee_id) : childMap.get(p.invitee_id) || String(p.invitee_id),
    }));
    return NextResponse.json(participantsWithNames);
  } catch (error) {
    console.error('Fetch participants error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
