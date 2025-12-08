import { NextResponse } from "next/server";
import { eventRepository } from "@/repositories/EventRepository";
import { EventService } from "@/services/EventService";

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

    const updatedEvent = await EventService.fullEventEditionWorflow(id, body)

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Update event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
