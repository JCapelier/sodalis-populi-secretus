import { NextResponse } from "next/server";
import { childRepository } from "@/repositories/ChildRepository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const ids = idsParam ? idsParam.split(",").map(Number) : [];
    const users = await childRepository.findByIds(ids);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users by ids:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
