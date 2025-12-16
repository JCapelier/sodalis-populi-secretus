import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { eventRepository } from "@/repositories/EventRepository";
import { Participant, ParticipantStatus } from "@/type";
import { isSameParticipant } from "@/utils/event-participant-utils";
import { NextResponse } from "next/server";

// Updates the participant status to "notified" when clicking the draft button for the first time. Updates event's status if needed.
export async function PUT(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const body = await request.json();

    console.log(body)
    const updatedParticipant = await eventParticipantRepository.updateStatusToNotified(id);

    const updateEventParticipants = body.eventParticipants.map((participant: Participant) => {
      if (isSameParticipant(participant, updatedParticipant)) return updatedParticipant;
      return participant;
    });

    const updatedEvent = updateEventParticipants.every((participant: Participant) => participant.status === ParticipantStatus.Notified)
      ? await eventRepository.updateStatusToActive(updatedParticipant.event_id!)
      : await eventRepository.findById(updatedParticipant.event_id!);

    return NextResponse.json({ updatedParticipant: updatedParticipant, eventPariticipants: updateEventParticipants, event: updatedEvent });
  } catch (error) {
    console.error('Error updating participant status:', error);
    return NextResponse.json({ error: 'Failed to update participant status', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
