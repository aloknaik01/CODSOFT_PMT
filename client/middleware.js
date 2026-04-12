import { NextResponse } from "next/server";

// Routes that require a logged-in user
const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/profile"];

// Routes that logged-in users should NOT see
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read the token cookie 
  const token = request.cookies.get("token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // No token trying to access protected page  go to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  //  Has token  trying to access login/register  go to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // All other cases  proceed normally
  return NextResponse.next();
}


export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};