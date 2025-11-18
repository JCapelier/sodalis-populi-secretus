import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Readonly<Request>) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const fetchQuery =  `SELECT id, username FROM users where username ILIKE $1`;
    const result = await query(fetchQuery, [`%${search}%`]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'No user corresponding to this username' }, { status: 404 });
    }

    return NextResponse.json({ users: result.rows}, {status: 200});
  } catch (error) {
    console.error('Could not find any user', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
