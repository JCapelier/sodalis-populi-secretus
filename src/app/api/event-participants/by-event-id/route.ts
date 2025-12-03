import { NextResponse } from "next/server";
import { InviteeType } from "@/type";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { userRepository } from "@/repositories/UserRepository";
import { childRepository } from "@/repositories/ChildRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = Number(searchParams.get("event-id"));

  if (!eventId) {
    return NextResponse.json({ error: "Missing event-id" }, { status: 400 });
  }

  try {
    const participants = await eventParticipantRepository.findByEventId(eventId);
    // Separate user and child IDs
    const userIds = participants.filter(participant => participant.type === InviteeType.User).map(participant => participant.invitee_id);
    const childrenIds = participants.filter(participant => participant.type === InviteeType.Child).map(participant => participant.invitee_id);

    // Fetch usernames for users
    const userMap = new Map();
    if (userIds.length > 0) {
      const users = await userRepository.findByIds(userIds);
      users.forEach(user => userMap.set(user.id, user.username));
    }
    // Fetch usernames for children
    const childMap = new Map();
    if (childrenIds.length > 0) {
      const children = await childRepository.findByIds(childrenIds);
      children.forEach(child => childMap.set(child.id, child.username));
    }

    // Attach usernames
    const participantsWithNames = participants.map(participant => ({
      invitee_id: participant.invitee_id,
      type: participant.type,
      username: participant.type === 'user' ? userMap.get(participant.invitee_id) || String(participant.invitee_id) : childMap.get(participant.invitee_id) || String(participant.invitee_id),
    }));
    return NextResponse.json(participantsWithNames);
  } catch (error) {
    console.error('Fetch participants error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
