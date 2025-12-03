import { NextResponse } from "next/server";
import { eventRepository } from "@/repositories/EventRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { Exclusion, ExclusionWithReciprocal, Participant, Status } from "@/type";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { DraftService } from "@/services/DraftService";
import { ExclusionService } from "@/services/ExclusionService";
import { AssignmentService } from "@/services/AssignmentService";

export async function POST(request: Readonly<Request>) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length <= 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!body.ends_at || isNaN(Date.parse(body.ends_at))) {
      return NextResponse.json({ error: 'Event must end at a valid date' }, { status: 400 });
    }

    // Prepare exclusions (with reciprocals) before any DB writes
    const exclusions: ExclusionWithReciprocal[] = [];
    for (const exclusion of body.exclusions) {
      exclusions.push({ ...exclusion });
      if (exclusion.reciprocal) {
        const reciprocalExclusion = ExclusionService.buildReciprocalExclusion(exclusion);
        if (!body.exclusions.some((exclusion: Exclusion) => ExclusionService.isSameExclusion(exclusion, reciprocalExclusion))) exclusions.push({ ...reciprocalExclusion });
      }
    }

    const inviteeKeys = body.participants.map((p: Participant) => ({ id: p.invitee_id, type: p.type }));
    if (!AssignmentService.hasValidAssignment(inviteeKeys, exclusions)) {
      return NextResponse.json({ error: "No valid assignment possible with these exclusions." }, { status: 400 });
    }

    // Only now create event and related records
    const event = await eventRepository.create(body);
    const eventId = event.id;

    for (const participant of body.participants) {
      await eventParticipantRepository.create({ ...participant, event_id: eventId, status: Status.Invited });
    }

    for (const exclusion of exclusions) {
      await exclusionRepository.create({ ...exclusion, event_id: eventId });
    }

    const draftResult = await DraftService.runDraft(eventId, inviteeKeys, exclusions);
    if (!draftResult.success) {
      return NextResponse.json({ error: draftResult.error || "Draft failed" }, { status: 400 });
    }

    return NextResponse.json({ event: event }, { status: 201 });
  } catch (error) {
    console.error('Create event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
