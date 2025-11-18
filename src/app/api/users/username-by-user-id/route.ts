import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user-id');

  if (!userId) return NextResponse.json({error: 'Missing event-id'}, {status: 400});

  const fetchUsernameByIdQuery = 'SELECT username FROM users WHERE id = $1';

  try {
    const result = await query(fetchUsernameByIdQuery, [userId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch username error', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
