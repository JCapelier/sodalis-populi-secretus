import { NextResponse } from "next/server";

import { userRepository } from "@/repositories/UserRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get('user-id'));

  if (!userId) return NextResponse.json({error: 'Missing event-id'}, {status: 400});

  try {
    const user = await userRepository.findById(userId);
    const username = user.username;
    return NextResponse.json(username);
  } catch (error) {
    console.error('Fetch username error', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
