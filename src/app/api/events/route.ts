import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hasValidAssignment } from "@/utils/form-validation-helper";
import { runDraft } from "@/utils/draft-helper";

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
    const insertParticipantQuery = `INSERT INTO event_participants (invitee_id, event_id, type) VALUES ($1, $2, $3)`;
    for (const participant of participants) {
      await query(insertParticipantQuery, [participant.invitee_id, eventId, participant.type])
    }

    const insertExclusionQuery = `INSERT INTO exclusions (event_id, invitee_id, invitee_type, excluded_invitee_id, excluded_invitee_type) VALUES ($1, $2, $3, $4, $5)`;
    // To avoid duplicate reciprocal insertions, keep a Set of processed pairs
    const exclusionPairs = new Set();
    for (const exclusion of exclusions) {
      const key = `${exclusion.invitee_id}:${exclusion.excluded_invitee_id}`;
      const reverseKey = `${exclusion.excluded_invitee_id}:${exclusion.invitee_id}`;
      if (!exclusionPairs.has(key)) {
        await query(insertExclusionQuery, [eventId, exclusion.invitee_id, exclusion.invitee_type, exclusion.excluded_invitee_id, exclusion.excluded_invitee_type]);
        exclusionPairs.add(key);
      }
      if (exclusion.reciprocal && !exclusionPairs.has(reverseKey)) {
        await query(insertExclusionQuery, [eventId, exclusion.excluded_invitee_id, exclusion.invitee_type, exclusion.invitee_id, exclusion.excluded_invitee_type]);
        exclusionPairs.add(reverseKey);
      }
    }


    // Map participants to {id, type, username} for assignment logic
    const assignmentParticipants = participants.map((p: any) => ({
      id: p.invitee_id,
      type: p.type,
      username: p.username,
    }));

    if (!hasValidAssignment(assignmentParticipants, exclusions)) {
      return NextResponse.json({ error: "No valid assignment possible with these exclusions." }, { status: 400 });
    }

    await runDraft(eventId, assignmentParticipants, exclusions);

    return NextResponse.json({ event: eventResult.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
