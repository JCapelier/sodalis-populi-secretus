import { Exclusion, Pairing, Participant } from "@/type";

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
  // Success: all givers assigned
  if (currentAssignments.length === givers.length) {
    return { pairings: currentAssignments, success: true };
  }

  // Find the next giver who needs a receiver
  const nextGiver = givers.find(giver =>
    !currentAssignments.some(assignment => assignment.giver_id === giver.user_id)
  );
  if (!nextGiver) {
    // Should not happen, but just in case
    return { pairings: currentAssignments, success: false };
  }

  // Get possible receivers for this giver
  const possibleReceivers = possibleDraws(
    nextGiver.user_id,
    receivers,
    exclusions,
    currentAssignments
  );

  // Try each possible receiver
  for (const receiver of possibleReceivers) {
    // Add this pairing
    currentAssignments.push({ giver_id: nextGiver.user_id, receiver_id: receiver.user_id });

    // Recurse
    const result = assignPairings(givers, receivers, exclusions, currentAssignments);
    if (result.success) {
      return result; // Found a valid assignment!
    }

    // Backtrack
    currentAssignments.pop();
  }

  // No valid assignment found for this giver
  return { pairings: currentAssignments, success: false };
}
