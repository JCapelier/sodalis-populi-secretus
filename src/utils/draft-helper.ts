import { query } from "@/lib/db";
import { shuffleArray } from "@/utils/shuffle-array";


// Updated types for id+type support
export type Participant = { id: number; username: string; type: 'user' | 'child' };
export type Exclusion = { invitee_id: number; invitee_type: 'user' | 'child'; excluded_invitee_id: number; excluded_invitee_type: 'user' | 'child' };
export type Pairing = { giver: { id: number; type: 'user' | 'child' }, receiver: { id: number; type: 'user' | 'child' } };

export function possibleDraws(
  drafter: { id: number; type: 'user' | 'child' },
  participants: Participant[],
  exclusions: Exclusion[],
  alreadyAssignedPairings: Pairing[],
): Participant[] {
  return participants.filter(participant =>
    !(participant.id === drafter.id && participant.type === drafter.type) &&
    !exclusions.some(exclusion =>
      exclusion.invitee_id === drafter.id &&
      exclusion.invitee_type === drafter.type &&
      exclusion.excluded_invitee_id === participant.id &&
      exclusion.excluded_invitee_type === participant.type
    ) &&
    !alreadyAssignedPairings.some(pairing =>
      pairing.receiver.id === participant.id && pairing.receiver.type === participant.type
    )
  );
}

export function assignPairings(
  givers: Participant[],
  receivers: Participant[],
  exclusions: Exclusion[],
  currentAssignments: Pairing[] = [],
): { pairings: Pairing[], success: boolean } {
  if (currentAssignments.length === givers.length) {
    return { pairings: currentAssignments.slice(), success: true };
  }
  const nextGiver = givers.find(giver =>
    !currentAssignments.some(assignment => assignment.giver.id === giver.id && assignment.giver.type === giver.type)
  );
  if (!nextGiver) {
    return { pairings: currentAssignments.slice(), success: false };
  }
  const possibleReceivers = shuffleArray(possibleDraws(
    { id: nextGiver.id, type: nextGiver.type },
    receivers,
    exclusions,
    currentAssignments
  ));
  for (const receiver of possibleReceivers) {
    currentAssignments.push({
      giver: { id: nextGiver.id, type: nextGiver.type },
      receiver: { id: receiver.id, type: receiver.type }
    });
    const result = assignPairings(givers, receivers, exclusions, currentAssignments);
    if (result.success) {
      return result;
    }
    currentAssignments.pop();
  }
  return { pairings: currentAssignments.slice(), success: false };
}

// Helper to run the full draft for an event (participants, exclusions fetched outside)
export async function runDraft(
  eventId: number,
  participants: Participant[],
  exclusions: Exclusion[],
): Promise<{ success: boolean; pairings?: Pairing[]; error?: string }> {
  const { pairings, success } = assignPairings(
    shuffleArray(participants),
    shuffleArray(participants),
    exclusions,
    []
  );
  if (!success || !pairings) {
    return { success: false, error: "No valid assignment possible for this event." };
  }
  // Remove old pairings for this event
  await query(`DELETE FROM pairings WHERE event_id = $1`, [eventId]);
  // Insert new pairings
  const insertPairingQuery = `INSERT INTO pairings (event_id, giver_id, giver_type, receiver_id, receiver_type) VALUES ($1, $2, $3, $4, $5)`;
  for (const pairing of pairings) {
    await query(insertPairingQuery, [eventId, pairing.giver.id, pairing.giver.type, pairing.receiver.id, pairing.receiver.type]);
  }
  return { success: true, pairings };
}
