import { query } from "@/lib/db";
import { Exclusion, Participant } from "@/type";
import { assignPairings } from "@/utils/draft-helper";
import { shuffleArray } from "@/utils/shuffle-array";
import { NextResponse } from "next/server";

export async function POST(request: Request, context: {params: {id: string}}) {
  const params = await context.params
  const eventId = Number(params.id);
  console.log(eventId)

  try {
    const body = await request.json();

    const eventParticipantsQuery = `SELECT * FROM event_participants WHERE event_id = $1`;
    const participantsResult = await query<Participant>(eventParticipantsQuery, [eventId]);
    const participants = participantsResult.rows;

    const eventPairingsQuery = `SELECT * FROM pairings WHERE event_id = $1`;
    const pairingsResult = await query(eventPairingsQuery, [eventId]);
    const pairings = pairingsResult.rows;

    const eventExclusionsQuery = `SELECT * FROM exclusions WHERE event_id = $1`;
    const exclusionsResult = await query<Exclusion>(eventExclusionsQuery, [eventId]);
    const exclusions = exclusionsResult.rows;


    if (pairings && pairings.some(pairing => pairing.giver_id === body.drafterId)) {
      return NextResponse.json({error: `You've already drafted someone for this event!`}, {status: 409});
    }

    const drafts = assignPairings(shuffleArray(participants), shuffleArray(participants), exclusions, []).pairings;
    const insertPairingQuery = `INSERT INTO pairings (event_id, giver_id, receiver_id) VALUES ($1, $2, $3)`;

    for (const pairing of drafts) {
      await query(insertPairingQuery, [eventId, pairing.giver_id, pairing.receiver_id])
    }

    return NextResponse.json({ success: true, pairings: drafts });
  } catch (error) {
    console.error('Draft error', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
