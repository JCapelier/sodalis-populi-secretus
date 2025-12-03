import { InviteeKey, Participant } from "@/type";

export class InviteeService {
  static isSameInvitee(invitee: InviteeKey, otherInvitee: InviteeKey): boolean {
    return (
      invitee.id === otherInvitee.id &&
      invitee.type === otherInvitee.type
    );
  }

  static areSameInvitees(invitees: InviteeKey[], otherInvitees: InviteeKey[]): boolean {
    const aInB = invitees.every((invitee) => otherInvitees.some((otherInvitee) => this.isSameInvitee(invitee, otherInvitee)));
    const bInA = otherInvitees.every((otherInvitee) => invitees.some((invitee) => this.isSameInvitee(invitee, otherInvitee)));
    return (aInB && bInA);
  }

  static removeInviteeFromInvited(participant: Participant, invited: Participant[]): Participant[] {
    return invited.filter(invitee =>
      !(invitee.invitee_id === participant.invitee_id && invitee.type === participant.type)
    );
  }
}
