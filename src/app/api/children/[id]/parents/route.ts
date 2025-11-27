import { childRepository } from "@/repositories/ChildRepository";
import { userRepository } from "@/repositories/UserRepository";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: {params: {id: string}}) {
  const params = await context.params;
  const id = Number(params.id);

  try {
    const { parent_id, other_parent_id } = await childRepository.getParentIds(id);

    const parent = await userRepository.findById(parent_id);

    const otherParent = other_parent_id ? await userRepository.findById(other_parent_id) : null;

    return NextResponse.json({ parent, otherParent }, { status: 200 });
  } catch (error) {
    console.error("Could not fetch parents for child", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
