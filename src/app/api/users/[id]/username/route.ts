import { userRepository } from "@/repositories/UserRepository";
import { NextResponse } from "next/server";


export async function PUT(request: Request, context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const body = await request.json();
    const changeUsername = await userRepository.updateUsername(id, body.username);

    if (!changeUsername) {
      return NextResponse.json({ error: "Could not update the username" }, { status: 500 });
    }

    return NextResponse.json(changeUsername);
  } catch (error) {
    console.error('Update username error', error);
    // Postgres unique violation error code is '23505'
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: 'This username is already taken.' }, { status: 400 });
    }
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
