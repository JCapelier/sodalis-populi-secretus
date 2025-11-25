import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function PUT(req: NextRequest,  context: any) {
  const params = await context.params;
  const userId = Number(params.id);
  const { oldPassword, newPassword } = await req.json();
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Fetch user
  const userResult = await query("SELECT password_hash FROM users WHERE id = $1", [userId]);
  if (userResult.rowCount === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const hashedPassword = userResult.rows[0].password_hash;
  const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
  if (!isMatch) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  // Hash new password
  const newHashed = await bcrypt.hash(newPassword, 10);
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHashed, userId]);
  return NextResponse.json({ success: true });
}
