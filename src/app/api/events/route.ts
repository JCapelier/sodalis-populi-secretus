import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Readonly<Request>) {
  try {
    const body = await request.json();
    const { name, ends_at, admin_id, price_limit_cents, participants, exclusions } = body;

    if (!name || typeof name !== 'string' || name.trim().length <= 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!ends_at || isNaN(Date.parse(ends_at))) {
      return NextResponse.json({ error: 'Event must end at a valid date' }, { status: 400 })
    }

    const insertEventQuery = `
      INSERT INTO events (name, ends_at, admin_id, price_limit_cents)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `;

    const eventResult = await query(insertEventQuery, [
      name.trim(),
      ends_at,
      admin_id,
      price_limit_cents || null,
    ]);

    const eventId = eventResult.rows[0].id;
    const insertParticipantQuery = `INSERT INTO event_participants (user_id, event_id, status) VALUES ($1, $2, $3)`;
    for (const participant of participants) {
      await query(insertParticipantQuery, [participant.user_id, eventId, 'invited'])
    }

    const insertExclusionQuery = `INSERT INTO exclusions (event_id, user_id, excluded_user_id) VALUES ($1, $2, $3)`;
    // To avoid duplicate reciprocal insertions, keep a Set of processed pairs
    const exclusionPairs = new Set();
    for (const exclusion of exclusions) {
      const key = `${exclusion.user_id}:${exclusion.excluded_user_id}`;
      const reverseKey = `${exclusion.excluded_user_id}:${exclusion.user_id}`;
      if (!exclusionPairs.has(key)) {
        await query(insertExclusionQuery, [eventId, exclusion.user_id, exclusion.excluded_user_id]);
        exclusionPairs.add(key);
      }
      if (exclusion.reciprocal && !exclusionPairs.has(reverseKey)) {
        await query(insertExclusionQuery, [eventId, exclusion.excluded_user_id, exclusion.user_id]);
        exclusionPairs.add(reverseKey);
      }
    }



    return NextResponse.json({ event: eventResult.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
