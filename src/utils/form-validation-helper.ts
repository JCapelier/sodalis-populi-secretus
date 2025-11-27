import { Exclusion, InviteeKey } from "@/type";

export function validateSignUp({
  username,
  password,
  confirmPassword,
}: {
  username: string;
  password: string;
  confirmPassword: string;
}): string | null {

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  if (!username.trim()) return 'Name is required';

  if (!usernameRegex.test(username)) return 'Username must use alphanumerical characters and underscores only';

  if (username.trim().length < 3 || username.trim().length > 20) return 'Username must be between 3 and 20 characters';


  if (!password) return 'Password is required';

  if (!passwordRegex.test(password)) return 'Password must be at least 8 characters long and have at least one number and one letter';

  if (password !== confirmPassword) return 'Password and confirmation do not match';

  return null;
}

export function hasValidAssignment(
  participants: InviteeKey[],
  exclusions: Exclusion[]
): boolean {
  console.log(participants)
  console.log(exclusions)
  const n = participants.length;
  if (n < 2) return false;

  // Helper to compare InviteeKey
  function isSameInvitee(a: InviteeKey, b: InviteeKey) {
    return a.id === b.id && a.type === b.type;
  }

  // Helper to check if exclusion blocks giver->receiver
  function isExcluded(giver: InviteeKey, receiver: InviteeKey) {
    const result =
      exclusions.some(ex =>
        ex.invitee_id === giver.id &&
        ex.invitee_type === giver.type &&
        ex.excluded_invitee_id === receiver.id &&
        ex.excluded_invitee_type === receiver.type
      ) || isSameInvitee(giver, receiver); // No self-draw
    console.log('Trying giver', giver, 'receiver', receiver, 'excluded?', result);
    return result;
  }

  // Backtracking: try to assign each giver to a receiver
  function backtrack(giverIdx: number, used: boolean[]): boolean {
    if (giverIdx === n) return true; // All assigned
    const giver = participants[giverIdx];
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      const receiver = participants[i];
      if (!isExcluded(giver, receiver)) {
        used[i] = true;
        if (backtrack(giverIdx + 1, used)) return true;
        used[i] = false;
      }
    }
    console.log('buidsfbiusd')
    return false;
  }

  return backtrack(0, Array(n).fill(false));
}
