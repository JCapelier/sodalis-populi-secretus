import { NextResponse } from "next/server";
import { childRepository } from "@/repositories/ChildRepository";

export async function POST(request: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const parentId = Number(params.id);

  try {
    const body = await request.json();
    const child = await childRepository.create({...body, parent_id: parentId});
    if (!child) {
      return NextResponse.json({ error: 'Failed to add child' }, { status: 500 });
    }
    return NextResponse.json({ child }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
  }
}
