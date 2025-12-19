import { childRepository } from "@/repositories/ChildRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { eventRepository } from "@/repositories/EventRepository";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { userRepository } from "@/repositories/UserRepository";
import { EventService } from "@/services/EventService";
import { InviteeType, Participant } from "@/type";
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

    const eventInfo = EventService.getEventInfo(event)

    const participantsRaw = await eventParticipantRepository.findByEventId(id);

    const usersIds = participantsRaw
      .filter(participant => participant.type === InviteeType.User)
      .map(participant => participant.invitee_id);

    const usersUsernames = await userRepository.findByIds(usersIds);

      const childrenIds = participantsRaw
        .filter(participant => participant.type === InviteeType.Child)
        .map(participant => participant.invitee_id);

      const childrenUsernames = await childRepository.findByIds(childrenIds);

      const participants: Participant[] = [];
      childrenUsernames.forEach(child => {
        const rawParticipant = participantsRaw.find((participant) => participant.invitee_id === child.id && participant.type === InviteeType.Child);
        participants.push({ id: rawParticipant!.id, invitee_id: child.id, type: InviteeType.Child, username: child.username, status: rawParticipant!.status })});
      usersUsernames.forEach(user => {
        const rawParticipant = participantsRaw.find((participant) => participant.invitee_id === user.id && participant.type === InviteeType.User);
        participants.push({ id: rawParticipant!.id, invitee_id: user.id, type: InviteeType.User, username: user.username, status: rawParticipant!.status })});

      // Build a map for O(1) participant lookup by composite key
      const participantMap = new Map<string, Participant>();
      participants.forEach(p => participantMap.set(`${p.invitee_id}-${p.type}`, p));

      // Fetch all exclusions for the event (with user_id, excluded_user_id)
      const exclusions = await exclusionRepository.findByEventId(event.id);

      // Attach usernames to exclusions using the map
      const exclusionsWithUsernames = exclusions.map(exclusion => ({
        ...exclusion,
        giverUsername: participantMap.get(`${exclusion.invitee_id}-${exclusion.invitee_type}`)?.username ?? '',
        receiverUsername: participantMap.get(`${exclusion.excluded_invitee_id}-${exclusion.excluded_invitee_type}`)?.username ?? ''
      }));

      // Get admin username
      const adminUsername = await userRepository.getUsernameById(event.admin_id);

      return {
        ...event,
        adminUsername,
        participants: participants,
        exclusions: exclusionsWithUsernames,
      };


    if (!eventInfo) {
      return NextResponse.json({error: "Could not find infos for event"}, {status: 404})
    }

    return NextResponse.json(eventInfo);
  } catch (error) {
    console.error("Fetch event error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
