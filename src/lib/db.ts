import { childRepository } from "@/repositories/ChildRepository";
import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { userRepository } from "@/repositories/UserRepository";
import { Event, EventInfo, Exclusion, InviteeType, Participant } from "@/type";
import { Pool, QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
});

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
  return pool.query<T>(text, params);
}

export async function getEventInfo(event: Event): Promise<EventInfo & {
  participants: Participant[];
  exclusions: (Exclusion & { giverUsername: string; receiverUsername: string })[];
}> {
  // Fetch all participants for the event (with user_id)
  const participants = await eventParticipantRepository.findByEventId(event.id);

  // Fetch all exclusions for the event (with user_id, excluded_user_id)
  const exclusions = await exclusionRepository.findByEventId(event.id);

  // Collect all unique user and child IDs needed (participants + exclusions)
  const userIds = new Set<number>();
  const childIds = new Set<number>();
  participants.forEach(participant => {
    if (participant.type === InviteeType.User) userIds.add(participant.invitee_id);
    else if (participant.type === InviteeType.Child) childIds.add(participant.invitee_id);
  });
  exclusions.forEach(event => {
    if (event.invitee_type === InviteeType.User) userIds.add(event.invitee_id);
    else if (event.invitee_type === InviteeType.Child) childIds.add(event.invitee_id);
    if (event.excluded_invitee_type === InviteeType.User) userIds.add(event.excluded_invitee_id);
    else if (event.excluded_invitee_type === InviteeType.Child) childIds.add(event.excluded_invitee_id);
  });

  // Fetch all usernames in one query for users
  const userMap = new Map<number, string>();
  if (userIds.size > 0) {
    const userIdList = Array.from(userIds);
    const users = await userRepository.findByIds(userIdList);
    users.forEach(user => userMap.set(user.id, user.username));
  }

  // Fetch all usernames in one query for children
  const childMap = new Map<number, string>();
  if (childIds.size > 0) {
    const childIdList = Array.from(childIds);
    const children = await childRepository.findByIds(childIdList);
    children.forEach(child => childMap.set(child.id, child.username));
  }

  // Attach usernames to participants
  const participantsWithNames = participants.map(participant => ({
    ...participant,
    username:
      participant.type === InviteeType.User
        ? userMap.get(participant.invitee_id) || String(participant.invitee_id)
        : childMap.get(participant.invitee_id) || String(participant.invitee_id),
  }));

  // Attach usernames to exclusions
  const exclusionsWithNames = exclusions.map(exclusion => ({
    ...exclusion,
    giverUsername:
      exclusion.invitee_type === InviteeType.User
        ? userMap.get(exclusion.invitee_id) || String(exclusion.invitee_id)
        : childMap.get(exclusion.invitee_id) || String(exclusion.invitee_id),
    receiverUsername:
      exclusion.excluded_invitee_type === InviteeType.User
        ? userMap.get(exclusion.excluded_invitee_id) || String(exclusion.excluded_invitee_id)
        : childMap.get(exclusion.excluded_invitee_id) || String(exclusion.excluded_invitee_id),
  }));

  // Get admin username
  const adminUsername = userMap.get(event.admin_id) || (await userRepository.getUsernameById(event.admin_id));

  return {
    ...event,
    adminUsername,
    participants: participantsWithNames,
    exclusions: exclusionsWithNames,
  };
}
