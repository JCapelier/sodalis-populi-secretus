import { Exclusion, Pairing, Participant } from "@/type";
import { query } from "@/lib/db";
import { shuffleArray } from "@/utils/shuffle-array";


export function possibleDraws(
  drafterId: Readonly<number>,
  participants: Participant[],
  exclusions: Exclusion[],
  alreadyAssignedPairings: Pairing[],
): Participant[] {
  const filteredParticipants = participants.filter(participant =>
    !(participant.user_id === drafterId) &&
    !(exclusions.some(exclusion =>
        exclusion.user_id === drafterId && exclusion.excluded_user_id === participant.user_id)) &&
    !(alreadyAssignedPairings.some(pairing =>
        pairing.receiver_id === participant.user_id
    )))
  return filteredParticipants
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
    !currentAssignments.some(assignment => assignment.giver_id === giver.user_id)
  );
  if (!nextGiver) {
    return { pairings: currentAssignments.slice(), success: false };
  }
  const possibleReceivers = shuffleArray(possibleDraws(
    nextGiver.user_id,
    receivers,
    exclusions,
    currentAssignments
  ));
  for (const receiver of possibleReceivers) {
    currentAssignments.push({ giver_id: nextGiver.user_id, receiver_id: receiver.user_id });
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
  const insertPairingQuery = `INSERT INTO pairings (event_id, giver_id, receiver_id) VALUES ($1, $2, $3)`;
  for (const pairing of pairings) {
    await query(insertPairingQuery, [eventId, pairing.giver_id, pairing.receiver_id]);
  }
  return { success: true, pairings };
}
