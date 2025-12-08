import { Exclusion, ExclusionWithReciprocal, ExclusionWithUsernames, ExclusionWithUsernamesAndReciprocal, InviteeKey, Participant } from "@/type";
import { isSameInvitee } from "./invitee-utils";

export function isSameExclusion(exclusion: Exclusion | ExclusionWithReciprocal, otherExclusion: Exclusion | ExclusionWithReciprocal): boolean {
  return (
    exclusion.invitee_id === otherExclusion.invitee_id &&
    exclusion.invitee_type === otherExclusion.invitee_type &&
    exclusion.excluded_invitee_id === otherExclusion.excluded_invitee_id &&
    exclusion.excluded_invitee_type === otherExclusion.excluded_invitee_type
  );
}

export function isRedundantExclusion(exclusion: Exclusion | ExclusionWithReciprocal, otherExclusion: Exclusion | ExclusionWithReciprocal): boolean {
  return (
    isSameExclusion(exclusion, otherExclusion) || areReciprocalExclusion(exclusion, otherExclusion)
  );
}


export function areSameExclusions(exclusions: Exclusion[], otherExclusion: Exclusion[]): boolean {
  const aInB = exclusions.every((exclusion) => otherExclusion.some((otherExclusion) => isSameExclusion(exclusion, otherExclusion)));
  const bInA = otherExclusion.every((otherExclusion) => exclusions.some((exclusion) => isSameExclusion(exclusion, otherExclusion)));
  return (aInB && bInA);
}

export function areSameExclusionUsernames(firstExclusionUsernames: ExclusionWithUsernames, secondExclusionUsernames: ExclusionWithUsernames): boolean {
  return firstExclusionUsernames.giverUsername === secondExclusionUsernames.giverUsername && firstExclusionUsernames.receiverUsername === secondExclusionUsernames.receiverUsername;
}

export function areReciprocalExclusionUsernames(firstExclusionUsernames: ExclusionWithUsernames, secondExclusionUsernames: ExclusionWithUsernames): boolean {
  return firstExclusionUsernames.giverUsername === secondExclusionUsernames.receiverUsername && firstExclusionUsernames.receiverUsername === secondExclusionUsernames.giverUsername;
}

export function areReciprocalExclusion(a: Exclusion | ExclusionWithReciprocal, b: Exclusion | ExclusionWithReciprocal): boolean {
  return (
    a.invitee_id === b.excluded_invitee_id &&
    a.invitee_type === b.excluded_invitee_type &&
    a.excluded_invitee_id === b.invitee_id &&
    a.excluded_invitee_type === b.invitee_type
  );
}

// Takes an array of exclusions, and check if some of these are reciprocal
export function inferReciprocalExclusions(rawExclusions: Exclusion[]): ExclusionWithReciprocal[] {
  const result: ExclusionWithReciprocal[] = [];
  for (const exclusion of rawExclusions) {
    // Skip if already present (either direction)
    if (result.some(alreadyExcluded =>
      isSameExclusion(exclusion, alreadyExcluded) ||
      areReciprocalExclusion(exclusion, alreadyExcluded)
    )) continue;

    const isReciprocal = rawExclusions.some(otherExclusion =>
      otherExclusion !== exclusion && areReciprocalExclusion(otherExclusion, exclusion)
    );
    result.push({ ...exclusion, reciprocal: isReciprocal });
  }
  return result;
}

export function buildReciprocalExclusion(exclusion: Exclusion): Exclusion {
  return {
    invitee_id: exclusion.excluded_invitee_id,
    invitee_type: exclusion.excluded_invitee_type,
    excluded_invitee_id: exclusion.invitee_id,
    excluded_invitee_type: exclusion.invitee_type,
  };
}

export function isExcluded(giver: InviteeKey, receiver: InviteeKey, exclusions: Exclusion[]) {
  return (
    exclusions.some(
      ex =>
        ex.invitee_id === giver.id &&
        ex.invitee_type === giver.type &&
        ex.excluded_invitee_id === receiver.id &&
        ex.excluded_invitee_type === receiver.type
    ) || isSameInvitee(giver, receiver)
  );
}

export function removeExclusionsWhenRemovingInvitee(exclusions: Exclusion[], invitee: Participant): Exclusion[] {
  return (
    exclusions.filter(exclusion =>
      !(exclusion.invitee_id === invitee.invitee_id && exclusion.invitee_type === invitee.type) &&
      !(exclusion.excluded_invitee_id === invitee.invitee_id && exclusion.excluded_invitee_type === invitee.type)
    )
  )
}

export function getUsernamesForExclusionsFromParticipants(
  exclusions: ExclusionWithReciprocal[],
  participants: Participant[]
): ExclusionWithUsernamesAndReciprocal[] {
  return exclusions.map((exclusion) => {
    const giver = participants.find(
      (participant) =>
        participant.invitee_id === exclusion.invitee_id &&
        participant.type === exclusion.invitee_type
    );
    const receiver = participants.find(
      (participant) =>
        participant.invitee_id === exclusion.excluded_invitee_id &&
        participant.type === exclusion.excluded_invitee_type
    );
    return {
      ...exclusion,
      giverUsername: giver?.username || "?",
      receiverUsername: receiver?.username || "?"
    };
  });
}

export function formatExclusion(exclusions: ExclusionWithUsernames[]): ExclusionWithUsernamesAndReciprocal[] {
  const displayedExclusions: ExclusionWithUsernames[] = [];
  const result: ExclusionWithUsernamesAndReciprocal[] = [];

  for (const exclusion of exclusions) {
    if (!exclusion.giverUsername || !exclusion.receiverUsername) continue;
    if (displayedExclusions.some(displayedExclusion =>
      areSameExclusionUsernames(exclusion, displayedExclusion) || areReciprocalExclusionUsernames(exclusion, displayedExclusion)
    )) continue;
    displayedExclusions.push(exclusion);
    const isReciprocal = exclusions.some(otherExclusion => areReciprocalExclusionUsernames(exclusion, otherExclusion));
    result.push({ ...exclusion, reciprocal: isReciprocal})
  }

  return result;
}

export function isNewExclusion(exclusions: ExclusionWithReciprocal[], newExclusion: ExclusionWithReciprocal): boolean {
  return (
    !(newExclusion.invitee_id === newExclusion.excluded_invitee_id && newExclusion.invitee_type === newExclusion.excluded_invitee_type) &&
    !exclusions.some((exclusion) =>
      exclusion.invitee_id === newExclusion.invitee_id &&
      exclusion.invitee_type === newExclusion.invitee_type &&
      exclusion.excluded_invitee_id === newExclusion.excluded_invitee_id &&
      exclusion.excluded_invitee_type === newExclusion.excluded_invitee_type)
  );
}

export function addNonReciprocalExclusionToList(exclusions: ExclusionWithReciprocal[], newExclusion: ExclusionWithReciprocal): ExclusionWithReciprocal[] {
  if (!isNewExclusion(exclusions, newExclusion)) return exclusions;

  return [...exclusions, newExclusion];
}

export function addReciprocalExclusionToList(exclusions: ExclusionWithReciprocal[], newExclusion: ExclusionWithReciprocal): ExclusionWithReciprocal[] {
  const reciprocalExclusion = buildReciprocalExclusion(newExclusion);

  if (!isNewExclusion(exclusions, newExclusion) || !isNewExclusion(exclusions, reciprocalExclusion)) return exclusions;

  return [...exclusions, newExclusion, reciprocalExclusion];
}

export function removeNonReciprocalExclusionFromList(exclusions: ExclusionWithReciprocal[], removedExclusion: ExclusionWithReciprocal): ExclusionWithReciprocal[] {
  return exclusions.filter((exclusion) => isSameExclusion(exclusion, removedExclusion));
}

export function removeReciprocalExclusionFromList(exclusions: ExclusionWithReciprocal[], removedExclusion: ExclusionWithReciprocal): ExclusionWithReciprocal[] {
  const reciprocalExclusion = buildReciprocalExclusion(removedExclusion);

  return exclusions.filter((exclusion) => isSameExclusion(exclusion, removedExclusion) && !isSameExclusion(exclusion, reciprocalExclusion));
}

export function prepareEventExclusions(exclusions: ExclusionWithReciprocal[]): Exclusion[] {
  const explicitExclusions: Exclusion[] = [];
  for (const exclusion of exclusions) {
    explicitExclusions.push({ ...exclusion });
    if (exclusion.reciprocal) {
      const reciprocalExclusion = buildReciprocalExclusion(exclusion);
      if (!explicitExclusions.some((ex) => isSameExclusion(ex, reciprocalExclusion))) {
        explicitExclusions.push({ ...reciprocalExclusion });
      }
    }
  }
  return explicitExclusions;
}
