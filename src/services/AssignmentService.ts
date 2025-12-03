import { Exclusion, InviteeKey } from "@/type";
import { ExclusionService } from "./ExclusionService";

export class AssignmentService {

  static hasValidAssignment(participants: InviteeKey[], exclusions: Exclusion[]): boolean {
    const n = participants.length;
    if (n < 2) return false;
    return this.backtrack(participants, exclusions, 0, Array(n).fill(false));
  }

  private static backtrack(
    participants: InviteeKey[],
    exclusions: Exclusion[],
    giverIdx: number,
    used: boolean[]
  ): boolean {
    const n = participants.length;
    if (giverIdx === n) return true;
    const giver = participants[giverIdx];
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      const receiver = participants[i];
      if (!ExclusionService.isExcluded(giver, receiver, exclusions)) {
        used[i] = true;
        if (this.backtrack(participants, exclusions, giverIdx + 1, used)) return true;
        used[i] = false;
      }
    }
    return false;
  }
}
