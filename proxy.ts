import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/twg" ||
    request.nextUrl.pathname === "/twg/confirm"
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/twg", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|woff2?)).*)"],
};