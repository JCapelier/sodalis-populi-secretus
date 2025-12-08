import { childRepository } from "@/repositories/ChildRepository";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    const ids = idsParam ? idsParam.split(",").map(Number) : [];

    const childrenWithParentUsernames = await childRepository.getParentsUsernamesFromIds(ids);
    console.log(childrenWithParentUsernames)
    return NextResponse.json(childrenWithParentUsernames, { status: 200 });
  } catch (error) {
    console.error("Could not fetch parent usernames", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
