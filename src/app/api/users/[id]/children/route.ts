import { NextResponse } from "next/server";
import { query } from "@/lib/db";


export async function POST(request: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const parentId = Number(params.id);

  try {
    const body = await request.json();
    const result = await query(
      `INSERT INTO children (username, parent_id, other_parent_id) VALUES ($1, $2, $3) RETURNING *`,
      [body.name, parentId, body.other_parent_id || null]
    );
    if (!result.rows || !result.rows[0]) {
      return NextResponse.json({ error: 'Failed to add child' }, { status: 500 });
    }
    return NextResponse.json({ child: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
  }
}
