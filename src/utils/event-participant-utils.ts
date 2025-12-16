import { EventParticipant, Participant, ParticipantStatus } from "@/type"

export function isSameParticipant(participant: Participant, otherParticipant: Participant): boolean {
  return (
    participant.invitee_id === otherParticipant.invitee_id &&
    participant.type === otherParticipant.type
  )
}

export function areSameParticipants(participants: Participant[], otherParticipants: Participant[]): boolean {
  return(
    ((participants.every((participant) =>
      otherParticipants.some((otherParticipant) =>
        isSameParticipant(participant, otherParticipant)))) &&
    (otherParticipants.every((otherParticipant) =>
      participants.some((participant) =>
        isSameParticipant(participant, otherParticipant)))))
  )
}

export function isParticipantAlreadyNotified(participant: EventParticipant) {
  return participant.status !== ParticipantStatus.Notified;
}
