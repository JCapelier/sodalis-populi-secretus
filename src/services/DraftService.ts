
import { pairingRepository } from "@/repositories/PairingRepository";
import { Exclusion, InviteeKey, Pairing } from "@/type";
import { assignPairings } from "@/utils/draft-utils";
import { shuffleArray } from "@/utils/shuffle-array";

export class DraftService {

  // Helper to run the full draft for an event (participants, exclusions fetched outside)
  static async runDraft(
    eventId: number,
    participants: InviteeKey[],
    exclusions: Exclusion[],
  ): Promise<{ success: boolean; pairings?: Pairing[]; error?: string }> {
    const { pairings, success } = assignPairings(
      shuffleArray(participants),
      shuffleArray(participants),
      exclusions,
      []
    );
    if (!success || !pairings) {
      return { success: false, error: "No valid assignment possible for this event from draft." };
    }
    // Remove old pairings for this event
    await pairingRepository.deleteByEventId(eventId);
    // Insert new pairings
    for (const pairing of pairings) {
      const data = {
        event_id: eventId,
        giver_id: pairing.giver_id,
        giver_type: pairing.giver_type,
        receiver_id: pairing.receiver_id,
        receiver_type: pairing.receiver_type,
      }
      await pairingRepository.create(data);
    }
    return { success: true, pairings };
  }
}
