
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event-id");
  if (!eventId) {
    return NextResponse.json({ error: "Missing event-id" }, { status: 400 });
  }
  // Return all exclusion fields needed for the form (no reciprocal, it's frontend-only)
  const exclusions = await query<{
    invitee_id: number;
    invitee_type: 'user' | 'child';
    excluded_invitee_id: number;
    excluded_invitee_type: 'user' | 'child';
  }>(
    `SELECT invitee_id, invitee_type, excluded_invitee_id, excluded_invitee_type FROM exclusions WHERE event_id = $1`,
    [eventId]
  );
  return NextResponse.json(exclusions.rows);
}

export async function PUT(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event-id");
  if (!eventId) {
    return NextResponse.json({ error: "Missing event-id" }, { status: 400 });
  }
  const exclusions = await req.json();
  if (!Array.isArray(exclusions)) {
    return NextResponse.json({ error: "Invalid exclusions array" }, { status: 400 });
  }
  // Remove all existing exclusions for this event
  await query(`DELETE FROM exclusions WHERE event_id = $1`, [eventId]);
  // Insert new exclusions
  for (const ex of exclusions) {
    if (
      typeof ex.user_id === "number" &&
      typeof ex.excluded_user_id === "number" &&
      ex.user_id !== ex.excluded_user_id
    ) {
      await query(
        `INSERT INTO exclusions (event_id, user_id, excluded_user_id) VALUES ($1, $2, $3)`,
        [eventId, ex.user_id, ex.excluded_user_id]
      );
    }
  }
  return NextResponse.json({ success: true });
}
