import { Exclusion, ExclusionWithReciprocal, ExclusionWithUsernames, ExclusionWithUsernamesAndReciprocal, InviteeKey, Participant } from "@/type";
import { InviteeService } from "./InviteeService";

export class ExclusionService {
  static isSameExclusion(exclusion: Exclusion, otherExclusion: Exclusion): boolean {
    return (
      exclusion.invitee_id === otherExclusion.invitee_id &&
      exclusion.invitee_type === otherExclusion.invitee_type &&
      exclusion.excluded_invitee_id === otherExclusion.excluded_invitee_id &&
      exclusion.excluded_invitee_type === otherExclusion.excluded_invitee_type
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

  static areReciprocalExclusion(a: Exclusion, b: Exclusion): boolean {
    return (
      a.invitee_id === b.excluded_invitee_id &&
      a.invitee_type === b.excluded_invitee_type &&
      a.excluded_invitee_id === b.invitee_id &&
      a.excluded_invitee_type === b.invitee_type
    );
  }

  // Takes an array of exclusions, and check if some of these are reciprocal
  static inferReciprocalExclusions(rawExclusions: Exclusion[]): ExclusionWithReciprocal[] {
    return rawExclusions.map(exclusion => {
      const isReciprocal = rawExclusions.some(otherExclusion =>
        otherExclusion !== exclusion && this.areReciprocalExclusion(otherExclusion, exclusion)
      );
      return {
        ...exclusion,
        reciprocal: isReciprocal
      };
    });
  }

  static buildReciprocalExclusion(exclusion: Exclusion): Exclusion {
    return ({
      invitee_id: exclusion.excluded_invitee_id,
      invitee_type: exclusion.excluded_invitee_type,
      excluded_invitee_id: exclusion.invitee_id,
      excluded_invitee_type: exclusion.invitee_type
    });
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
}
