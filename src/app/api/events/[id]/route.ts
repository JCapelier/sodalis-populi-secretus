import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hasValidAssignment } from "@/utils/form-validation-helper";
import { runDraft } from "@/utils/draft-helper";
import { Exclusion, Participant } from "@/type";
import { eventRepository } from "@/repositories/EventRepository";

export async function GET(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const event = await eventRepository.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error("Fetch event error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: {params: Promise<{id: string}>}) {
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
    const deleteParticipantQuery = `DELETE FROM event_participants WHERE invitee_id = $1 AND event_id = $2`;
    const insertParticipantQuery = `INSERT INTO event_participants (invitee_id, event_id, status) VALUES ($1, $2, $3)`;

    const previousParticipants = await query<Participant>(previousParticipantsQuery, [id]);

    // Get arrays of user IDs for easier comparison
    const prevUserIds = previousParticipants.rows.map((p) => p.invitee_id);
    const newUserIds = body.participants.map((p: Participant) => p.invitee_id);

    // 1. Add new participants
    for (const participant of body.participants) {
      if (!prevUserIds.includes(participant.invitee_id)) {
        // Insert with default status, e.g., 'invited'
        await query(insertParticipantQuery, [participant.invitee_id, id, "invited"]);
      }
    }

    // 2. Remove participants not in the new list
    for (const previousParticipant of previousParticipants.rows) {
      if (!newUserIds.includes(previousParticipant.invitee_id)) {
        await query(deleteParticipantQuery, [previousParticipant.invitee_id, id]);
      }
    }

    const previousExclusionsQuery = `SELECT * FROM exclusions WHERE event_id = $1`;
    const deleteExclusionQuery = `DELETE FROM exclusions WHERE event_id = $1 AND invitee_id = $2 AND excluded_invitee_id = $3`;
    const insertExclusionQuery = `INSERT INTO exclusions (event_id, invitee_id, excluded_invitee_id) VALUES ($1, $2, $3)`;

    const previousExclusionsResult = await query<Exclusion>(previousExclusionsQuery, [id]);
    const previousExclusions = previousExclusionsResult.rows;

    // Build a Set of new exclusion keys (including reciprocals)
    const newExclusionKeys = new Set<string>();
    for (const exclusion of body.exclusions) {
      const key = `${exclusion.user_id}:${exclusion.excluded_user_id}`;
      newExclusionKeys.add(key);
      if (exclusion.reciprocal) {
        const reverseKey = `${exclusion.excluded_user_id}:${exclusion.user_id}`;
        newExclusionKeys.add(reverseKey);
      }
    }

    // 1. Remove exclusions that are in the DB but not in the new list
    for (const prev of previousExclusions) {
      const key = `${prev.invitee_id}:${prev.excluded_invitee_id}`;
      if (!newExclusionKeys.has(key)) {
        await query(deleteExclusionQuery, [id, prev.invitee_id, prev.excluded_invitee_id]);
      }
    }

    // 2. Add exclusions that are in the new list but not in the DB
    // To avoid duplicate inserts, keep a Set of processed keys
    // Prepare up-to-date participants and exclusions for the check
    const editingParticipants = body.participants;
    // Build exclusions array (including reciprocals)
    const editingExclusions: Exclusion[] = [];
    for (const exclusion of body.exclusions) {
      editingExclusions.push({
        invitee_id: exclusion.invitee_id,
        invitee_type: exclusion.invitee_type,
        excluded_invitee_id: exclusion.excluded_invitee_id,
        excluded_invitee_type: exclusion.excluded_invitee_type
      });
      if (exclusion.reciprocal) {
        editingExclusions.push({
          invitee_id: exclusion.excluded_invitee_id,
          invitee_type: exclusion.excluded_invitee_type,
          excluded_invitee_id: exclusion.invitee_id,
          excluded_invitee_type: exclusion.invitee_type
        });
      }
    }
    if (!hasValidAssignment(editingParticipants, editingExclusions)) {
      return NextResponse.json({ error: "No valid assignment possible with these exclusions." }, { status: 400 });
    }

    const insertedKeys = new Set(previousExclusions.map((ex) => `${ex.invitee_id}:${ex.excluded_invitee_id}`));
    for (const exclusion of body.exclusions) {
      const key = `${exclusion.invitee_id}:${exclusion.excluded_invitee_id}`;
      if (!insertedKeys.has(key)) {
        await query(insertExclusionQuery, [id, exclusion.invitee_id, exclusion.excluded_invitee_id]);
        insertedKeys.add(key);
      }
      if (exclusion.reciprocal) {
        const reverseKey = `${exclusion.excluded_invitee_id}:${exclusion.invitee_id}`;
        if (!insertedKeys.has(reverseKey)) {
          await query(insertExclusionQuery, [id, exclusion.excluded_invitee_id, exclusion.invitee_id]);
          insertedKeys.add(reverseKey);
        }
      }
    }

    const prevUserIdsSorted = prevUserIds.slice().sort();
    const newUserIdsSorted = newUserIds.slice().sort();
    const participantsChanged = JSON.stringify(prevUserIdsSorted) !== JSON.stringify(newUserIdsSorted);

    const prevExclusionKeys = previousExclusions.map((e) => `${e.invitee_id}:${e.excluded_invitee_id}`).sort();
    const newExclusionKeysArr = editingExclusions.map((e) => `${e.invitee_id}:${e.excluded_invitee_id}`).sort();
    const exclusionsChanged = JSON.stringify(prevExclusionKeys) !== JSON.stringify(newExclusionKeysArr);

    if (participantsChanged || exclusionsChanged) {
      await runDraft(id, editingParticipants, editingExclusions);
    }
    return NextResponse.json(eventResult.rows[0]);
  } catch (error) {
    console.error('Update event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
