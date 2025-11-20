import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: {params: {id: number}}) {
  const params = await context.params;
  const eventId = Number(params.id);

  const { searchParams } = new URL(request.url);
  const userIdString = searchParams.get('userId');
  const userId = userIdString ? Number(userIdString) : undefined;
    console.log('API DEBUG userId:', userId, typeof userId, 'eventId:', eventId, typeof eventId);

  try {
    const myPairingQuery = `SELECT receiver_id FROM pairings WHERE giver_id = $1 AND event_id = $2`;
    type PairingRow = { receiver_id: number };
    const myPairing = await query(myPairingQuery, [userId, eventId]) as { rows: PairingRow[] };
    if (!myPairing.rows.length) {
      return NextResponse.json({ error: "Pairing not found" }, { status: 404 });
    }

    const myReceiverQuery = `SELECT username FROM users WHERE id = $1`;
    type ReceiverRow = { username: string };
    const myReceiver = await query(myReceiverQuery, [myPairing.rows[0].receiver_id]) as { rows: ReceiverRow[] };
    if (!myReceiver.rows.length) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    const username = myReceiver.rows?.[0]?.username;
    console.log('API DEBUG username:', username);
    return NextResponse.json({ username });
  } catch (error) {
    console.error('Fetching receiver username failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
