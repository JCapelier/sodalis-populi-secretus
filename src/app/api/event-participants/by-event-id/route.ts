import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event-id");

  if (!eventId) {
    return NextResponse.json({ error: "Missing event-id" }, { status: 400 });
  }

  const fetchParticipantsAndUsernameByEventIdQuery = `SELECT event_participant.*, "user".username
    FROM event_participants AS event_participant
    JOIN users AS "user" ON event_participant.user_id = "user".id
    WHERE event_participant.event_id = $1`;

  try {
    const result = await query(fetchParticipantsAndUsernameByEventIdQuery, [eventId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch participants error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
