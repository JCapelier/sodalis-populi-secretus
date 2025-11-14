import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }
  try {
    const result = await query("SELECT * FROM events WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch event error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params.id);
  try {
    const body = await request.json(); // <-- FIX: get the body from the request
    const updateQuery = `UPDATE events
      SET name = $1,
          ends_at = $2,
          price_limit_cents = $3
      WHERE id = $4
      RETURNING *`;

    const result = await query(updateQuery, [
      body.name,
      body.ends_at,
      body.price_limit_cents,
      id
    ]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.log('Update event error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
