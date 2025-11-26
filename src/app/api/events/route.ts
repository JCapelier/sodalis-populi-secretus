import { NextResponse } from "next/server";
import { hasValidAssignment } from "@/utils/form-validation-helper";
import { runDraft } from "@/utils/draft-helper";
import { eventRepository } from "@/repositories/EventRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { Exclusion, ExclusionWithReciprocal } from "@/type";
import { buildReciprocalExclusion } from "@/utils/build-reciprocal";
import { isSameExclusion } from "@/utils/comparison-helper";
import { exclusionRepository } from "@/repositories/ExclusionRepository";

export async function POST(request: Readonly<Request>) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length <= 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!body.ends_at || isNaN(Date.parse(body.ends_at))) {
      return NextResponse.json({ error: 'Event must end at a valid date' }, { status: 400 });
    }

    const event = await eventRepository.create(body);
    const eventId = event.id;

    for (const participant of body.participants) {
      await eventParticipantRepository.create(participant);
    }

    // To avoid duplicate reciprocal insertions, keep a Set of processed pairs
    const exclusions: ExclusionWithReciprocal[] = [];
    for (const exclusion of body.exclusions) {
      exclusions.push(exclusion);
      if (exclusion.reciprocal) {
        const reciprocalExclusion = buildReciprocalExclusion(exclusion);
        if (!body.exclusions.some((exclusion: Exclusion) => isSameExclusion(exclusion, reciprocalExclusion))) exclusions.push(reciprocalExclusion);
      }
    }

    for (const exclusion of exclusions) {
      exclusionRepository.create({...exclusion, event_id: eventId});
    }

    if (!hasValidAssignment(body.participants, exclusions)) {
      return NextResponse.json({ error: "No valid assignment possible with these exclusions." }, { status: 400 });
    }

    await runDraft(eventId, body.participants, exclusions);

    return NextResponse.json({ event: event }, { status: 201 });
  } catch (error) {
    console.error('Create event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
