import { apiGet } from "@/lib/api";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { Event, EventInfo, ExclusionWithUsernames, InviteeType, Participant } from "@/type";

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
}
