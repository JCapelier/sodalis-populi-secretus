import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/users/sign-in", "/users/sign-up", "/api/auth/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If not authenticated, redirect to sign-in
  const session = request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token");
  if (!session) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|public|api/auth).*)",
  ],
};
