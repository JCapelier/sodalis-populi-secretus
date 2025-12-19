import { eventRepository } from "@/repositories/EventRepository";
import { EventService } from "@/services/EventService";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const id = Number(params.id);

  // This is the same as EventService.getEventInfo, but without any api call.
  try {
    const event = await eventRepository.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventInfo = EventService.getEventInfoServerSide(event)

    return NextResponse.json(eventInfo);
  } catch (error) {
    console.error("Fetch event error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
