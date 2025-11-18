import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }
  try {
    const result = await query("SELECT * FROM events WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch event error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params.id);
  try {
    const body = await request.json();
    const updateEventQuery = `UPDATE events
      SET name = $1,
          ends_at = $2,
          price_limit_cents = $3
      WHERE id = $4
      RETURNING *`;

    const eventResult = await query(updateEventQuery, [
      body.name,
      body.ends_at,
      body.price_limit_cents,
      id
    ]);

    const previousParticipantsQuery = `SELECT * FROM event_participants WHERE event_id = $1`;
    const deleteParticipantQuery = `DELETE FROM event_participants WHERE user_id = $1 AND event_id = $2`;
    const insertParticipantQuery = `INSERT INTO event_participants (user_id, event_id, status) VALUES ($1, $2, $3)`;

    const previousParticipants = await query(previousParticipantsQuery, [id]);

    // Get arrays of user IDs for easier comparison
    const prevUserIds = previousParticipants.rows.map((p: any) => p.user_id);
    const newUserIds = body.participants.map((p: any) => p.user_id);

    // 1. Add new participants
    for (const participant of body.participants) {
      if (!prevUserIds.includes(participant.user_id)) {
        // Insert with default status, e.g., 'invited'
        await query(insertParticipantQuery, [participant.user_id, id, "invited"]);
      }
    }

    // 2. Remove participants not in the new list
    for (const previousParticipant of previousParticipants.rows) {
      if (!newUserIds.includes(previousParticipant.user_id)) {
        await query(deleteParticipantQuery, [previousParticipant.user_id, id]);
      }
    }

    return NextResponse.json(eventResult.rows[0]);
  } catch (error) {
    console.log('Update event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
