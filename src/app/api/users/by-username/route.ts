import { NextResponse } from "next/server";
import { userRepository } from "@/repositories/UserRepository";

export async function GET(request: Readonly<Request>) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('username');

    if (!adminUsername || adminUsername.trim().length <= 0) {
      return NextResponse.json({ error: 'Admin username is required' }, { status: 400 });
    }

    const adminId = await userRepository.findByUsername(adminUsername)

    if (!adminId) {
      return NextResponse.json({ error: 'No user id corresponding to this username' }, { status: 404 });
    }

    return NextResponse.json({ id: adminId}, { status: 200 });

  } catch (error) {
    console.error('Finding admin id error', error);
    return NextResponse.json( {error: 'Internal server error' }, { status: 500 })
  }
}
