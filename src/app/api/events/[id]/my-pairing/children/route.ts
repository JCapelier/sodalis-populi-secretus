import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const eventId = Number(params.id);

  const { searchParams } = new URL(request.url);
  const childIdString = searchParams.get('childId');
  const childId = childIdString ? Number(childIdString) : undefined;

  try {
    const myPairingQuery = `SELECT receiver_id, receiver_type FROM pairings WHERE giver_id = $1 AND giver_type = 'child'  AND event_id = $2`;
    type PairingRow = { receiver_id: number, receiver_type: 'child' | 'user' };
    const myPairing = await query(myPairingQuery, [childId, eventId]) as { rows: PairingRow[] };
    if (!myPairing.rows.length) {
      return NextResponse.json({ error: "Pairing not found" }, { status: 404 });
    }

    const myReceiverQuery = myPairing.rows[0].receiver_type === 'user' ? `SELECT username FROM users WHERE id = $1` : `SELECT username FROM children WHERE id = $1`;
    type ReceiverRow = { username: string };
    const myReceiver = await query(myReceiverQuery, [myPairing.rows[0].receiver_id]) as { rows: ReceiverRow[] };
    if (!myReceiver.rows.length) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    const username = myReceiver.rows?.[0]?.username;
    return NextResponse.json({ username });
  } catch (error) {
    console.error('Fetching receiver username failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
