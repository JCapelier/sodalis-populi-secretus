import { childRepository } from "@/repositories/ChildRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { userRepository } from "@/repositories/UserRepository";
import { InviteeType } from "@/type";
import { NextResponse } from "next/server";

export async function GET(request: Request, context : {params: Promise<{id: string}>}) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const child = await childRepository.findById(id);
    if (!child) {
      return new Response(JSON.stringify({ error: "Child not found" }), { status: 404 });
    }

    let other_parent_username = undefined;
    if (child.other_parent_id) {
      const otherParent = await userRepository.findById(child.other_parent_id);
      other_parent_username = otherParent?.username;
    }

    return new Response(
      JSON.stringify({
        ...child,
        other_parent_username,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const body = await request.json();
    // Accept username, parent_id, and other_parent_id from the request body
    const { username, parent_id, other_parent_id } = body;
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    const childUpdated = await childRepository.update(id, {
      username,
      parent_id,
      other_parent_id,
    });
    return NextResponse.json(childUpdated);
  } catch (error) {
    console.error('Update child error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const childEvents = await eventParticipantRepository.findByInvitee(id, InviteeType.Child)
      if (childEvents && childEvents.length > 0) {
        return NextResponse.json({ error: 'Cannot delete a child participating in an event' }, { status: 409 });
    }
    await childRepository.delete(id);
    return new NextResponse(null, { status: 204 }); // No Content


  } catch (error) {
    console.error('Delete child error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
