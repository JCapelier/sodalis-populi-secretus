import { Exclusion, Participant } from "@/type";

export function validateSignUp({
  username,
  email,
  password,
  confirmPassword,
}: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): string | null {

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  if (!username.trim()) return 'Name is required';

  if (!usernameRegex.test(username)) return 'Username must use alphanumerical characters and underscores only';

  if (username.trim().length < 3 || username.trim().length > 20) return 'Username must be between 3 and 20 characters';

  if (!email) return 'Email is required';

  if (!emailRegex.test(email)) return 'Invalid email';

  if (!password) return 'Password is required';

  if (!passwordRegex.test(password)) return 'Password must be at least 8 characters long and have at least one number and one letter';

  if (password !== confirmPassword) return 'Password and confirmation do not match';

  return null;
}

export function hasValidAssignment(
  participants: Participant[],
  exclusions: Exclusion[]
): boolean {
  const n = participants.length;
  // Use array of {id, type} for uniqueness
  const ids = participants.map(p => ({ invitee_id: p.invitee_id, type: p.type }));

  // Build exclusion map: {id, type} -> Set of forbidden {id, type} (including self)
  function key(obj: { invitee_id: number; type: string }) {
    return `${obj.invitee_id}:${obj.type}`;
  }
  const exclusionMap = new Map<string, Set<string>>();
  for (const p of participants) {
    exclusionMap.set(key(p), new Set([key(p)]));
  }
  for (const ex of exclusions) {
    const from = `${ex.invitee_id}:${ex.invitee_type}`;
    const to = `${ex.excluded_invitee_id}:${ex.excluded_invitee_type}`;
    exclusionMap.get(from)?.add(to);
  }

  // Backtracking: try to assign each giver to a receiver
  function backtrack(giverIdx: number, used: Set<string>): boolean {
    if (giverIdx === n) return true; // All assigned
    const giver = ids[giverIdx];
    for (const receiver of ids) {
      const receiverKey = key(receiver);
      if (!used.has(receiverKey) && !exclusionMap.get(key(giver))?.has(receiverKey)) {
        used.add(receiverKey);
        if (backtrack(giverIdx + 1, used)) return true;
        used.delete(receiverKey);
      }
    }
    // Debug: log failed assignment for this giver
    if (typeof console !== 'undefined') {
      console.warn(`No valid receiver for giver ${key(giver)} at position ${giverIdx}`);
    }
    return false;
  }

  const result = backtrack(0, new Set());
  if (!result && typeof console !== 'undefined') {
    console.error('No valid Secret Santa assignment possible with current exclusions and participants.');
  }
  return result;
}
