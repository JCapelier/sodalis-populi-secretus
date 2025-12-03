import { NextResponse } from "next/server";
import { Exclusion, InviteeKey, Participant, Status } from "@/type";
import { eventRepository } from "@/repositories/EventRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { ExclusionService } from "@/services/ExclusionService";
import { InviteeService } from "@/services/InviteeService";
import { DraftService } from "@/services/DraftService";
import { AssignmentService } from "@/services/AssignmentService";

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

export async function DELETE(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    await eventRepository.delete(id);
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Delete event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
        const reciprocalExclusion = ExclusionService.buildReciprocalExclusion(exclusion);
        if (!body.exclusions.some((ex: Exclusion) => ExclusionService.isSameExclusion(ex, reciprocalExclusion))) exclusions.push({ ...reciprocalExclusion });
      }
    }

    // Use InviteeKey[] for assignment validation, just like POST
    if (!AssignmentService.hasValidAssignment(newParticipantsKeys, exclusions)) {
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
        await eventParticipantRepository.deleteByInviteeIdAndType(previousParticipantKey.id, previousParticipantKey.type);
      }
    }

    const previousExclusions = await exclusionRepository.findByEventId(id);

    // Remove exclusions that are in the DB but not in the new list
    for (const previousExclusion of previousExclusions) {
      if (!exclusions.find((exclusion) => ExclusionService.isSameExclusion(previousExclusion, exclusion))) {
        await exclusionRepository.delete(previousExclusion.id!);
      }
    }

    // Add exclusions that are in the new list but not in the DB
    for (const exclusion of exclusions) {
      const alreadyExists = previousExclusions.some((previousExclusion) => ExclusionService.isSameExclusion(previousExclusion, exclusion))
      if (!alreadyExists) await exclusionRepository.create({...exclusion, event_id: id});
    }

    const inviteesChanged = !InviteeService.areSameInvitees(previousParticipantsKeys, newParticipantsKeys);
    const exclusionsChanged = !ExclusionService.areSameExclusions(previousExclusions, exclusions);

    if (inviteesChanged || exclusionsChanged) {
      await DraftService.runDraft(id, newParticipantsKeys, exclusions);
    }

    const updatedEvent = await eventRepository.findById(id);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Update event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
