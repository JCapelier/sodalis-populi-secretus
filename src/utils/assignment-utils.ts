import { Exclusion, InviteeKey } from "@/type";
import { isExcluded } from "./exclusion-utils";

export function hasValidAssignment(participants: InviteeKey[], exclusions: Exclusion[]): boolean {
  const n = participants.length;
  if (n < 2) return false;
  return backtrack(participants, exclusions, 0, Array(n).fill(false));
}

function backtrack(
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
    if (!isExcluded(giver, receiver, exclusions)) {
      used[i] = true;
      if (backtrack(participants, exclusions, giverIdx + 1, used)) return true;
      used[i] = false;
    }
  }
  return false;
}
