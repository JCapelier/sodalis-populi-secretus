import { Exclusion, ExclusionWithReciprocal, ExclusionWithUsernames, ExclusionWithUsernamesAndReciprocal, InviteeKey, Participant } from "@/type";
import { InviteeService } from "./InviteeService";

export class ExclusionService {
  static isSameExclusion(exclusion: Exclusion | ExclusionWithReciprocal, otherExclusion: Exclusion | ExclusionWithReciprocal): boolean {
    return (
      exclusion.invitee_id === otherExclusion.invitee_id &&
      exclusion.invitee_type === otherExclusion.invitee_type &&
      exclusion.excluded_invitee_id === otherExclusion.excluded_invitee_id &&
      exclusion.excluded_invitee_type === otherExclusion.excluded_invitee_type
    );
  }

  static isRedundantExclusion(exclusion: Exclusion | ExclusionWithReciprocal, otherExclusion: Exclusion | ExclusionWithReciprocal): boolean {
    return (
      (this.isSameExclusion(exclusion, otherExclusion) || (this.areReciprocalExclusion(exclusion, otherExclusion)))
    );
  }
  static areSameExclusions(exclusions: Exclusion[], otherExclusion: Exclusion[]): boolean {
    const aInB = exclusions.every((exclusion) => otherExclusion.some((otherExclusion) => this.isSameExclusion(exclusion, otherExclusion)));
    const bInA = otherExclusion.every((otherExclusion) => exclusions.some((exclusion) => this.isSameExclusion(exclusion, otherExclusion)));
    return (aInB && bInA);
  }

  static areSameExclusionUsernames(firstExclusionUsernames: ExclusionWithUsernames, secondExclusionUsernames: ExclusionWithUsernames): boolean {
    return firstExclusionUsernames.giverUsername === secondExclusionUsernames.giverUsername && firstExclusionUsernames.receiverUsername === secondExclusionUsernames.receiverUsername;
  }

  static areReciprocalExclusionUsernames(firstExclusionUsernames: ExclusionWithUsernames, secondExclusionUsernames: ExclusionWithUsernames): boolean {
    return firstExclusionUsernames.giverUsername === secondExclusionUsernames.receiverUsername && firstExclusionUsernames.receiverUsername === secondExclusionUsernames.giverUsername;
  }

  static areReciprocalExclusion(a: Exclusion | ExclusionWithReciprocal, b: Exclusion | ExclusionWithReciprocal): boolean {
    return (
      a.invitee_id === b.excluded_invitee_id &&
      a.invitee_type === b.excluded_invitee_type &&
      a.excluded_invitee_id === b.invitee_id &&
      a.excluded_invitee_type === b.invitee_type
    );
  }

  // Takes an array of exclusions, and check if some of these are reciprocal
  static inferReciprocalExclusions(rawExclusions: Exclusion[]): ExclusionWithReciprocal[] {
    const result: ExclusionWithReciprocal[] = [];
    for (const exclusion of rawExclusions) {
      // Skip if already present (either direction)
      if (result.some(alreadyExcluded =>
        this.isSameExclusion(exclusion, alreadyExcluded) ||
        this.areReciprocalExclusion(exclusion, alreadyExcluded)
      )) continue;

      const isReciprocal = rawExclusions.some(otherExclusion =>
        otherExclusion !== exclusion && this.areReciprocalExclusion(otherExclusion, exclusion)
      );
      result.push({ ...exclusion, reciprocal: isReciprocal });
    }
    return result;
  }

  static buildReciprocalExclusion(exclusion: Exclusion): Exclusion {
    return {
      invitee_id: exclusion.excluded_invitee_id,
      invitee_type: exclusion.excluded_invitee_type,
      excluded_invitee_id: exclusion.invitee_id,
      excluded_invitee_type: exclusion.invitee_type,
    };
  }

  static isExcluded(giver: InviteeKey, receiver: InviteeKey, exclusions: Exclusion[]) {
    return (
      exclusions.some(
        ex =>
          ex.invitee_id === giver.id &&
          ex.invitee_type === giver.type &&
          ex.excluded_invitee_id === receiver.id &&
          ex.excluded_invitee_type === receiver.type
      ) || InviteeService.isSameInvitee(giver, receiver)
    );
  }

  static removeExclusionsWhenRemovingInvitee(exclusions: Exclusion[], invitee: Participant): Exclusion[] {
    return (
      exclusions.filter(exclusion =>
        !(exclusion.invitee_id === invitee.invitee_id && exclusion.invitee_type === invitee.type) &&
        !(exclusion.excluded_invitee_id === invitee.invitee_id && exclusion.excluded_invitee_type === invitee.type)
      )
    )
  }

  static getUsernamesForExclusionsFromParticipants(
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

  static formatExclusion(exclusions: ExclusionWithUsernames[]): ExclusionWithUsernamesAndReciprocal[] {
    const displayedExclusions: ExclusionWithUsernames[] = [];
    const result: ExclusionWithUsernamesAndReciprocal[] = [];

    for (const exclusion of exclusions) {
      if (!exclusion.giverUsername || !exclusion.receiverUsername) continue;
      if (displayedExclusions.some(displayedExclusion =>
        this.areSameExclusionUsernames(exclusion, displayedExclusion) || this.areReciprocalExclusionUsernames(exclusion, displayedExclusion)
      )) continue;
      displayedExclusions.push(exclusion);
      const isReciprocal = exclusions.some(otherExclusion => this.areReciprocalExclusionUsernames(exclusion, otherExclusion));
      result.push({ ...exclusion, reciprocal: isReciprocal})
    }

    return result;
  }

  static isNewExclusion(exclusions: ExclusionWithReciprocal[], newExclusion: ExclusionWithReciprocal): boolean {
    return (
      !(newExclusion.invitee_id === newExclusion.excluded_invitee_id && newExclusion.invitee_type === newExclusion.excluded_invitee_type) &&
      !exclusions.some((exclusion) =>
        exclusion.invitee_id === newExclusion.invitee_id &&
        exclusion.invitee_type === newExclusion.invitee_type &&
        exclusion.excluded_invitee_id === newExclusion.excluded_invitee_id &&
        exclusion.excluded_invitee_type === newExclusion.excluded_invitee_type)
    );
  }

  static addNonReciprocalExclusionToList(exclusions: ExclusionWithReciprocal[], newExclusion: ExclusionWithReciprocal): ExclusionWithReciprocal[] {
    if (!this.isNewExclusion(exclusions, newExclusion)) return exclusions;

    return [...exclusions, newExclusion];
  }

  static addReciprocalExclusionToList(exclusions: ExclusionWithReciprocal[], newExclusion: ExclusionWithReciprocal): ExclusionWithReciprocal[] {
    const reciprocalExclusion = this.buildReciprocalExclusion(newExclusion);

    if (!this.isNewExclusion(exclusions, newExclusion) || !this.isNewExclusion(exclusions, reciprocalExclusion)) return exclusions;

    return [...exclusions, newExclusion, reciprocalExclusion];
  }

  static removeNonReciprocalExclusionFromList(exclusions: ExclusionWithReciprocal[], removedExclusion: ExclusionWithReciprocal): ExclusionWithReciprocal[] {
    return exclusions.filter((exclusion) => !this.isSameExclusion(exclusion, removedExclusion));
  }

  static removeReciprocalExclusionFromList(exclusions: ExclusionWithReciprocal[], removedExclusion: ExclusionWithReciprocal): ExclusionWithReciprocal[] {
    const reciprocalExclusion = this.buildReciprocalExclusion(removedExclusion);

    return exclusions.filter((exclusion) => !this.isSameExclusion(exclusion, removedExclusion) && !this.isSameExclusion(exclusion, reciprocalExclusion));
  }

  static prepareEventExclusions(exclusions: ExclusionWithReciprocal[]): Exclusion[] {
    const explicitExclusions: Exclusion[] = [];
    for (const exclusion of exclusions) {
      explicitExclusions.push({ ...exclusion });
      if (exclusion.reciprocal) {
        const reciprocalExclusion = ExclusionService.buildReciprocalExclusion(exclusion);
        if (!explicitExclusions.some((ex) => ExclusionService.isSameExclusion(ex, reciprocalExclusion))) {
          explicitExclusions.push({ ...reciprocalExclusion });
        }
      }
    }
    return explicitExclusions;
  }


}
