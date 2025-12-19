import { apiGet } from "@/lib/api";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { Event, EventInfo, EventPayload, ExclusionWithReciprocal, ExclusionWithUsernames, InviteeType, Participant, ParticipantStatus } from "@/type";
import { ExclusionService } from "./ExclusionService";
import { NextResponse } from "next/server";
import { eventRepository } from "@/repositories/EventRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { DraftService } from "./DraftService";
import { EventParticipantService } from "./EventParticipantService";
import { buildReciprocalExclusion, isSameExclusion, prepareEventExclusions } from "@/utils/exclusion-utils";
import { shouldRunDraft } from "@/utils/event-utils";
import { hasValidAssignment } from "@/utils/assignment-utils";
import { userRepository } from "@/repositories/UserRepository";
import { childRepository } from "@/repositories/ChildRepository";


export class EventService {

  static async getEventInfo(event: Event): Promise<EventInfo & {
    participants: Participant[];
    exclusions: ExclusionWithUsernames[];
  }> {
    const participantsRaw = await apiGet<Participant[]>(`/api/event-participants/by-event-id?event-id=${event.id}`);

    const usersIds = participantsRaw
      .filter(participant => participant.type === InviteeType.User)
      .map(participant => participant.invitee_id);

    const usersUsernames = await apiGet<{id: number, username: string}[]>(`/api/users/by-ids?ids=${usersIds.join(',')}`);

    const childrenIds = participantsRaw
      .filter(participant => participant.type === InviteeType.Child)
      .map(participant => participant.invitee_id);

    const childrenUsernames = await apiGet<{id: number, username: string}[]>(`/api/children/by-ids?ids=${childrenIds.join(',')}`);

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
    const adminUsername = await apiGet<string>(`/api/users/username-by-user-id?user-id=${event.admin_id}`);

    return {
      ...event,
      adminUsername,
      participants: participants,
      exclusions: exclusionsWithUsernames,
    };
  }

  static async getEventInfoServerSide(event: Event): Promise<EventInfo & {
    participants: Participant[];
    exclusions: ExclusionWithUsernames[];
  }> {
    const participantsRaw = await eventParticipantRepository.findByEventId(event.id);

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
  }

  static async prepareEventExclusions(body: EventPayload) {
    const exclusions: ExclusionWithReciprocal[] = [];
    for (const exclusion of body.exclusions) {
      exclusions.push({ ...exclusion });
      if (exclusion.reciprocal) {
        const reciprocalExclusion = buildReciprocalExclusion(exclusion);
        if (!body.exclusions.some((exclusion) => isSameExclusion(exclusion, reciprocalExclusion))) exclusions.push({ ...reciprocalExclusion });
      }
    }
  }

  static async fullEventEditionWorflow(eventId: number, body: EventPayload) {

    const previousParticipants = await eventParticipantRepository.findByEventId(eventId);
    const previousExclusions = await exclusionRepository.findByEventId(eventId);

    const newParticipantsKeys = body.participants.map((participant) => ({ id: participant.invitee_id, type: participant.type }));
    const exclusions = prepareEventExclusions(body.exclusions);

    if (!hasValidAssignment(newParticipantsKeys, exclusions)) {
      return { error: "No valid assignment possible with these exclusions." };
    }

    await EventParticipantService.updateEventParticipants(eventId, previousParticipants, body.participants)

    await ExclusionService.updateEventExclusions(eventId, previousExclusions, exclusions)

    let draftResult = null;
    if (shouldRunDraft(previousParticipants, body.participants, previousExclusions, exclusions)) {
      draftResult = await DraftService.runDraft(eventId, newParticipantsKeys, exclusions);
      await eventParticipantRepository.resetParticipantsStatusForEvent(eventId);
      if (!draftResult.success) return { error: draftResult.error || "Draft failed" };
    }

    const updatedEvent = await eventRepository.update(eventId, {
      name: body.name,
      ends_at: body.ends_at,
      price_limit_cents: body.price_limit_cents
    })
    return { event: updatedEvent, draftResult };
  }

  static async fullEventCreationWorkflow(body: EventPayload) {
    const inviteeKeys = body.participants.map((participant) => ({ id: participant.invitee_id, type: participant.type }));
    if (!hasValidAssignment(inviteeKeys, body.exclusions)) {
      return { error: "No valid assignment possible with these exclusions." };
    }

    const createdEvent = await eventRepository.create(body);
    if (!createdEvent) return { error: 'Event creation failed'};

    const exclusions = prepareEventExclusions(body.exclusions);

    const createdParticipants = await eventParticipantRepository.createAllParticipantsForEvent(createdEvent.id, body.participants);
    if (!createdParticipants) return { error: 'Participants creation failed'};

    const createdExclusions = await exclusionRepository.createAllExclusionsForEvent(createdEvent.id, exclusions);
    if (!createdExclusions) return { error: 'Exlusions creation failed'};

    const isValid = await DraftService.runDraft(createdEvent.id, inviteeKeys, exclusions);
    if (!isValid) return { error: 'Pairings creation failed'}

    return {event: createdEvent, participants: createdParticipants, exclusions: createdExclusions, isValid: isValid}
  }


  static async createParticipantsAndExclusionsForEvent(event: Event, body: EventPayload) {
    for (const participant of body.participants) {
      await eventParticipantRepository.create({ ...participant, event_id: event.id, status: ParticipantStatus.Invited });
    }

    for (const exclusion of body.exclusions) {
      await exclusionRepository.create({ ...exclusion, event_id: event.id });
    }
  }

  static async draftForEvent(event: Event, body: EventPayload) {
    const inviteeKeys = body.participants.map((participant) => ({ id: participant.invitee_id, type: participant.type }));
    const draftResult = await DraftService.runDraft(event.id, inviteeKeys, body.exclusions);
    if (!draftResult.success) {
      return NextResponse.json({ error: draftResult.error || "Draft failed" }, { status: 400 });
    }
  }


}
