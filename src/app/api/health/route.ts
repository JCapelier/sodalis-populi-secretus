import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type NowRow = { now: string };

export async function GET() {
  try {
    const res = await query<NowRow>("select now()");
    return NextResponse.json({ ok: true, time: res.rows[0].now });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
