import { Exclusion, InviteeKey } from "@/type";

export function isSameExclusion(exclusion: Exclusion, otherExclusion: Exclusion): boolean {
  return (
    exclusion.invitee_id === otherExclusion.invitee_id &&
    exclusion.invitee_type === otherExclusion.invitee_type &&
    exclusion.excluded_invitee_id === otherExclusion.excluded_invitee_id &&
    exclusion.excluded_invitee_type === otherExclusion.excluded_invitee_type
  );
}

export function areSameExclusions(exclusions: Exclusion[], otherExclusion: Exclusion[]): boolean {
  const aInB = exclusions.every((exclusion) => otherExclusion.some((otherExclusion) => isSameExclusion(exclusion, otherExclusion)));
  const bInA = otherExclusion.every((otherExclusion) => exclusions.some((exclusion) => isSameExclusion(exclusion, otherExclusion)));
  return (aInB && bInA);
}

export function isSameInvitee(invitee: InviteeKey, otherInvitee: InviteeKey): boolean {
  return (
    invitee.id === otherInvitee.id &&
    invitee.type === otherInvitee.type
  );
}

export function areSameInvitees(invitees: InviteeKey[], otherInvitees: InviteeKey[]): boolean {
  const aInB = invitees.every((invitee) => otherInvitees.some((otherInvitee) => isSameInvitee(invitee, otherInvitee)));
  const bInA = otherInvitees.every((otherInvitee) => invitees.some((invitee) => isSameInvitee(invitee, otherInvitee)));
  return (aInB && bInA);
}
