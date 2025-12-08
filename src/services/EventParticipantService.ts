import { eventParticipantRepository } from "@/repositories/EventParticipantRepository";
import { Participant, Status } from "@/type";

export class EventParticipantService {
  static async updateEventParticipants(eventId: number, previousParticipants: Participant[], newParticipants: Participant[]) {
    const participantsToAdd = newParticipants.filter((newParticipant) =>
      !previousParticipants.some((previousParticipant) =>
        previousParticipant.invitee_id === newParticipant.invitee_id &&
        previousParticipant.type === newParticipant.type));

    for (const participant of participantsToAdd) {
      await eventParticipantRepository.create({
        event_id: eventId,
        invitee_id: participant.invitee_id,
        type: participant.type,
        status: Status.Invited
      });
    }

    const participantsToRemove = previousParticipants.filter((previousParticipant) =>
      !newParticipants.some((newParticipant) =>
        newParticipant.invitee_id === previousParticipant.invitee_id &&
        newParticipant.type === previousParticipant.type));

    for (const participant of participantsToRemove) {
      await eventParticipantRepository.deleteByInviteeIdAndType(participant.invitee_id, participant.type);
    }
  }
}
