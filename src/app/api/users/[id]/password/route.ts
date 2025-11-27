import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { userRepository } from "@/repositories/UserRepository";

export async function PUT(req: NextRequest,  context: {params: Promise<{id: string}>}) {
  const params = await context.params;
  const userId = Number(params.id);
  const { oldPassword, newPassword } = await req.json();
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Fetch user
  const oldPasswordHashed = await userRepository.getPasswordHashById(userId);
  const isMatch = await bcrypt.compare(oldPassword, oldPasswordHashed);
  if (!isMatch) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  // Hash new password
  const newHashed = await bcrypt.hash(newPassword, 10);
  const updatePassword = await userRepository.updatePassword(userId, newHashed);
  return NextResponse.json(updatePassword);
}
