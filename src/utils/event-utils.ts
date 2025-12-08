import { Exclusion, Participant } from "@/type";
import { areSameExclusions } from "./exclusion-utils";
import { areSameParticipants } from "./event-participant-utils";

export function shouldRunDraft(previousParticipants: Participant[], newParticipants: Participant[], previousExclusions: Exclusion[], newExclusions: Exclusion[]): boolean {
  const haveInviteesChanged = !areSameParticipants(previousParticipants, newParticipants);
  const haveExclusionsChanged = !areSameExclusions(previousExclusions, newExclusions);

  return haveInviteesChanged || haveExclusionsChanged;
}
