import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect logged-in users away from login page
  if (pathname === '/login' && token) {
    // send authenticated users back to the public landing page
    url.pathname = '/dashboard/drafts';
    return NextResponse.redirect(url);
  }

  // Protect /dashboard and any subpaths
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
