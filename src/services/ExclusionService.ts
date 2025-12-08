import { Exclusion } from "@/type";
import { exclusionRepository } from "@/repositories/ExclusionRepository";
import { isSameExclusion } from "@/utils/exclusion-utils";

export class ExclusionService {

  static async updateEventExclusions(eventId: number, previousExclusions: Exclusion[], newExclusions: Exclusion[]) {
    const exclusionsToAdd = newExclusions.filter((newExclusion) =>
      !previousExclusions.some((previousExclusions =>
        isSameExclusion(newExclusion, previousExclusions))));

    for (const exclusion of exclusionsToAdd) {
      await exclusionRepository.create({
        event_id: eventId,
        invitee_id: exclusion.invitee_id,
        invitee_type: exclusion.invitee_type,
        excluded_invitee_id: exclusion.excluded_invitee_id,
        excluded_invitee_type: exclusion.excluded_invitee_type
      })
    }

    const exclusionsToRemove = previousExclusions.filter((previousExclusion) =>
      !newExclusions.some((newExclusion) =>
        isSameExclusion(newExclusion, previousExclusion)));

    for (const exclusion of exclusionsToRemove) {
      await exclusionRepository.delete(exclusion.id!)
    }
  }
}
