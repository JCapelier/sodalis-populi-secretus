import { childRepository } from "@/repositories/ChildRepository";
import { pairingRepository } from "@/repositories/PairingRepository";
import { userRepository } from "@/repositories/UserRepository";
import { InviteeType } from "@/type";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const eventId = Number(params.id);

  const { searchParams } = new URL(request.url);
  const userIdString = searchParams.get('userId');
  const userId = Number(userIdString);

  try {
    const myReceiverKey = await pairingRepository.findReceiverByGiverAndEvent(userId, InviteeType.User, eventId);
    if (!myReceiverKey) return NextResponse.json({ error: "Pairing not found" }, { status: 404 });


    const myReceiver = myReceiverKey.type === InviteeType.User ? await userRepository.findById(myReceiverKey.id) : await childRepository.findById(myReceiverKey.id)
    if (!myReceiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    const username = myReceiver.username;
    return NextResponse.json({ username });
  } catch (error) {
    console.error('Fetching receiver username failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
