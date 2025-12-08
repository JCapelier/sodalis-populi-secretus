import { Exclusion, InviteeKey, Pairing } from "@/type";
import { shuffleArray } from "./shuffle-array";

export function possibleDraws(
  drafter: InviteeKey,
  participants: InviteeKey[],
  exclusions: Exclusion[],
  alreadyAssignedPairings: Pairing[],
): InviteeKey[] {
  return participants.filter(participant =>
    !(participant.id === drafter.id && participant.type === drafter.type) &&
    !exclusions.some(exclusion =>
      exclusion.invitee_id === drafter.id &&
      exclusion.invitee_type === drafter.type &&
      exclusion.excluded_invitee_id === participant.id &&
      exclusion.excluded_invitee_type === participant.type
    ) &&
    !alreadyAssignedPairings.some(pairing =>
      pairing.receiver_id === participant.id && pairing.receiver_type === participant.type
    )
  );
}

export function assignPairings(
  givers: InviteeKey[],
  receivers: InviteeKey[],
  exclusions: Exclusion[],
  currentAssignments: Pairing[] = [],
): { pairings: Pairing[], success: boolean } {
  if (currentAssignments.length === givers.length) {
    return { pairings: currentAssignments.slice(), success: true };
  }
  const nextGiver = givers.find(giver =>
    !currentAssignments.some(assignment => assignment.giver_id === giver.id && assignment.giver_type === giver.type)
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
      giver_id: nextGiver.id,
      giver_type: nextGiver.type,
      receiver_id: receiver.id,
      receiver_type: receiver.type });
    const result = assignPairings(givers, receivers, exclusions, currentAssignments);
    if (result.success) {
      return result;
    }
    currentAssignments.pop();
  }
  return { pairings: currentAssignments.slice(), success: false };
}
