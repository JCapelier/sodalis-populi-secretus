import { inviteeRepository } from "@/repositories/InviteeRepository";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const search = searchParams.get('search') || '';

    const suggestions = await inviteeRepository.findInviteesByPartialUsername(search)

    if (!suggestions) {
      return NextResponse.json({ error: 'No user or child corresponding to this username' }, { status: 404 });
    }

    return NextResponse.json({ suggestions: suggestions }, {status: 200});
  } catch (error) {
    console.error('Could not find any user or child', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
