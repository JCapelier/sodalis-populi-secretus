import { NextRequest, NextResponse } from "next/server";
import { Exclusion, ExclusionWithReciprocal } from "@/type";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { buildReciprocalExclusion, isSameExclusion } from "@/utils/exclusion-utils";

export async function GET(request: NextRequest) {
  const eventId = Number(request.nextUrl.searchParams.get("event-id"));
  if (!eventId) {
    return NextResponse.json({ error: "Missing event-id" }, { status: 400 });
  }
  // Return all exclusion fields needed for the form (no reciprocal, it's frontend-only)
  const exclusions = await exclusionRepository.findByEventId(eventId);
  return NextResponse.json(exclusions);
}

export async function PUT(request: NextRequest) {
  const eventId = Number(request.nextUrl.searchParams.get("event-id"));

  const exclusions: ExclusionWithReciprocal[] = await request.json();

  // Remove all existing exclusions for this event
  await exclusionRepository.deleteByEventId(eventId);

  // Insert new exclusions
  const fullExclusions: Exclusion[] = [];
  for (const exclusion of exclusions) {
    fullExclusions.push(exclusion)
    if (exclusion.reciprocal) {
      const reciprocalExclusion = buildReciprocalExclusion(exclusion);
      if (!fullExclusions.some((fullExclusion) => isSameExclusion(fullExclusion, reciprocalExclusion))) fullExclusions.push(reciprocalExclusion);
    }
  }

  for (const fullExclusion of fullExclusions) await exclusionRepository.create({...fullExclusion, event_id: eventId})

  return NextResponse.json(fullExclusions);
}
