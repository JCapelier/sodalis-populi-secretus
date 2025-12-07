import { apiGet } from "@/lib/api";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { Event, EventInfo, EventPayload, ExclusionWithReciprocal, ExclusionWithUsernames, InviteeType, Participant, Status } from "@/type";
import { ExclusionService } from "./ExclusionService";
import { AssignmentService } from "./AssignmentService";
import { NextResponse } from "next/server";
import { eventRepository } from "@/repositories/EventRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { DraftService } from "./DraftService";

export class EventService {

  static async getEventInfo(event: Event): Promise<EventInfo & {
    participants: Participant[];
    exclusions: ExclusionWithUsernames[];
  }> {
    // Fetch all participants for the event (with user_id)
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
    childrenUsernames.forEach(child => participants.push({ invitee_id: child.id, type: InviteeType.Child, username: child.username }));
    usersUsernames.forEach(user => participants.push({ invitee_id: user.id, type: InviteeType.User, username: user.username }));

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

  static async prepareEventExclusions(body: EventPayload) {
    const exclusions: ExclusionWithReciprocal[] = [];
    for (const exclusion of body.exclusions) {
      exclusions.push({ ...exclusion });
      if (exclusion.reciprocal) {
        const reciprocalExclusion = ExclusionService.buildReciprocalExclusion(exclusion);
        if (!body.exclusions.some((exclusion) => ExclusionService.isSameExclusion(exclusion, reciprocalExclusion))) exclusions.push({ ...reciprocalExclusion });
      }
    }
  }

  static async fullEventCreationWorkflow(body: EventPayload) {
    const inviteeKeys = body.participants.map((participant) => ({ id: participant.invitee_id, type: participant.type }));
    if (!AssignmentService.hasValidAssignment(inviteeKeys, body.exclusions)) {
      return { error: "No valid assignment possible with these exclusions." };
    }

    const createdEvent = await eventRepository.create(body);
    if (!createdEvent) return { error: 'Event creation failed'};

    const exclusions = ExclusionService.prepareEventExclusions(body.exclusions);

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
      await eventParticipantRepository.create({ ...participant, event_id: event.id, status: Status.Invited });
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
