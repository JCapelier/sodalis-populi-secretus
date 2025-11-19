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
  const ids = participants.map(p => p.user_id);

  // Build exclusion map: user_id -> Set of forbidden user_ids (including self)
  const exclusionMap = new Map<number, Set<number>>();
  for (const p of participants) {
    exclusionMap.set(p.user_id, new Set([p.user_id]));
  }
  for (const ex of exclusions) {
    exclusionMap.get(ex.user_id)?.add(ex.excluded_user_id);
  }

  // Backtracking: try to assign each giver to a receiver
  function backtrack(giverIdx: number, used: Set<number>): boolean {
    if (giverIdx === n) return true; // All assigned
    const giver = ids[giverIdx];
    for (const receiver of ids) {
      if (!used.has(receiver) && !exclusionMap.get(giver)?.has(receiver)) {
        used.add(receiver);
        if (backtrack(giverIdx + 1, used)) return true;
        used.delete(receiver);
      }
    }
    return false;
  }

  return backtrack(0, new Set());
}
