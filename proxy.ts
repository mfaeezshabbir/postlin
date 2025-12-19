import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow requests to /api/auth/* (NextAuth routes)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect to login if accessing protected routes without token
  if (pathname.startsWith("/dashboard") && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing login/register with token
  if ((pathname === "/login" || pathname === "/register") && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/posts";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
