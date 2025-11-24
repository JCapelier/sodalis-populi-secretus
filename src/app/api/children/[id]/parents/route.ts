import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    // Get parent_id and other_parent_id from children table
    const childRes = await query(
      `SELECT parent_id, other_parent_id FROM children WHERE id = $1`,
      [id]
    );
    if (!childRes.rows || childRes.rows.length === 0) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }
    const { parent_id, other_parent_id } = childRes.rows[0];

    // Get parent username
    const parentRes = await query(
      `SELECT id, username FROM users WHERE id = $1`,
      [parent_id]
    );
    const parent = parentRes.rows[0] || null;

    // Get other parent username if exists
    let otherParent = null;
    if (other_parent_id) {
      const otherParentRes = await query(
        `SELECT id, username FROM users WHERE id = $1`,
        [other_parent_id]
      );
      otherParent = otherParentRes.rows[0] || null;
    }

    return NextResponse.json({ parent, otherParent }, { status: 200 });
  } catch (error) {
    console.error("Could not fetch parents for child", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
