import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Readonly<Request>) {
  try {
    const body = await request.json();
    const { name, ends_at, admin_id, price_limit_cents } = body;

    if (!name || typeof name !== 'string' || name.trim().length <= 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!ends_at || isNaN(Date.parse(ends_at))) {
      return NextResponse.json({ error: 'Event must end at a valid date' }, { status: 400 })
    }

    const insertQuery = `
      INSERT INTO events (name, ends_at, admin_id, price_limit_cents)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `;
      const result = await query(insertQuery, [
        name.trim(),
        ends_at,
        admin_id,
        price_limit_cents || null,
      ]);

    return NextResponse.json({ event: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
