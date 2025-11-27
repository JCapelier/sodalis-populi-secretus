import { NextResponse } from "next/server";
import { hasValidAssignment } from "@/utils/form-validation-helper";
import { runDraft } from "@/utils/draft-helper";
import { Exclusion, InviteeKey, Participant, Status } from "@/type";
import { eventRepository } from "@/repositories/EventRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { areSameExclusions, areSameInvitees, isSameExclusion } from "@/utils/comparison-helper";
import { buildReciprocalExclusion } from "@/utils/build-reciprocal";

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

    const previousParticipants = await eventParticipantRepository.findByEventId(id);
    const previousParticipantsKeys: InviteeKey[] = previousParticipants.map((participant) => ({id: participant.invitee_id, type: participant.type}));
    const newParticipantsKeys: InviteeKey[] = body.participants.map((participant: Participant) => ({id: participant.invitee_id, type: participant.type}));

    // Prepare exclusions (with reciprocals) before any DB writes
    const exclusions: Exclusion[] = [];
    for (const exclusion of body.exclusions) {
      exclusions.push({ ...exclusion });
      if (exclusion.reciprocal) {
        const reciprocalExclusion = buildReciprocalExclusion(exclusion);
        if (!body.exclusions.some((ex: Exclusion) => isSameExclusion(ex, reciprocalExclusion))) exclusions.push({ ...reciprocalExclusion });
      }
    }

    // Use InviteeKey[] for assignment validation, just like POST
    if (!hasValidAssignment(newParticipantsKeys, exclusions)) {
      return NextResponse.json({ error: "No valid assignment possible with these exclusions." }, { status: 400 });
    }

    // Now perform DB updates
    // 1. Add new participants
    for (const newParticipantKey of newParticipantsKeys) {
      if (!previousParticipantsKeys.some(p => p.id === newParticipantKey.id && p.type === newParticipantKey.type)) {
        await eventParticipantRepository.create({event_id: id, invitee_id: newParticipantKey.id, type: newParticipantKey.type, status: Status.Invited});
      }
    }

    // 2. Remove participants not in the new list
    for (const previousParticipantKey of previousParticipantsKeys) {
      if (!newParticipantsKeys.some(p => p.id === previousParticipantKey.id && p.type === previousParticipantKey.type)) {
        await eventParticipantRepository.delete(previousParticipantKey.id);
      }
    }

    const previousExclusions = await exclusionRepository.findByEventId(id);

    // Remove exclusions that are in the DB but not in the new list
    for (const previousExclusion of previousExclusions) {
      if (!exclusions.find((exclusion) => isSameExclusion(previousExclusion, exclusion))) {
        await exclusionRepository.delete(previousExclusion.id!);
      }
    }

    // Add exclusions that are in the new list but not in the DB
    for (const exclusion of exclusions) {
      const alreadyExists = previousExclusions.some((previousExclusion) => isSameExclusion(previousExclusion, exclusion))
      if (!alreadyExists) await exclusionRepository.create({...exclusion, event_id: id});
    }

    const inviteesChanged = !areSameInvitees(previousParticipantsKeys, newParticipantsKeys);
    const exclusionsChanged = !areSameExclusions(previousExclusions, exclusions);

    if (inviteesChanged || exclusionsChanged) {
      await runDraft(id, newParticipantsKeys, exclusions);
    }

    const updatedEvent = await eventRepository.findById(id);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Update event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
