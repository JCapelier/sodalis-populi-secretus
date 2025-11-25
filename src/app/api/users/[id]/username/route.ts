import { query } from "@/lib/db";
import { NextResponse } from "next/server";


export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const body = await request.json();
    const changeUsernameResult = await query(`UPDATE users SET username = $1 WHERE id = $2 RETURNING *`, [body.username, id]);

    if (changeUsernameResult.rows.length === 0) {
      return NextResponse.json({ error: "Could not update the username" }, { status: 500 });
    }

    return NextResponse.json(changeUsernameResult.rows[0]);
  } catch (error) {
    console.error('Update username error', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
