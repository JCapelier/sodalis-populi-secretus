import { NextResponse } from "next/server";
import { EventService } from "@/services/EventService";

export async function POST(request: Readonly<Request>) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length <= 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!body.ends_at || isNaN(Date.parse(body.ends_at))) {
      return NextResponse.json({ error: 'Event must end at a valid date' }, { status: 400 });
    }

    const result = await EventService.fullEventCreationWorkflow(body);
    if ('error' in result) {
      return NextResponse.json({error: result.error}, {status: 400})
    }

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error('Create event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
