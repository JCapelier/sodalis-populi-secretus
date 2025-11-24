import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const search = searchParams.get('search');

    const fetchQuery = `SELECT id, username, 'user' AS type FROM users WHERE username ILIKE $1
                        UNION ALL
                        SELECT id, username, 'child' AS type FROM children WHERE username ILIKE $1`
    const result = await query(fetchQuery, [`%${search}%`]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'No user or child corresponding to this username' }, { status: 404 });
    }

    return NextResponse.json({ users: result.rows}, {status: 200});
  } catch (error) {
    console.error('Could not find any user or child', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
