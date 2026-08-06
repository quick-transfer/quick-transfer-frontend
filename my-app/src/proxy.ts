import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getRedirectPathByRole,
  isJwtFresh,
  isRouteAllowedForRole,
  ROLE_COOKIE_NAME,
} from "@/lib/auth";

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(ROLE_COOKIE_NAME);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const userRole = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const isLoginPage = pathname === "/login";
  const hasFreshToken = isJwtFresh(authToken);

  if (isLoginPage) {
    const response = NextResponse.next();
    if (authToken && !hasFreshToken) {
      response.cookies.delete(AUTH_COOKIE_NAME);
      response.cookies.delete(ROLE_COOKIE_NAME);
    }
    return response;
  }

  if (!hasFreshToken) {
    return redirectToLogin(request);
  }

  if (!isRouteAllowedForRole(pathname, userRole)) {
    return NextResponse.redirect(new URL(getRedirectPathByRole(userRole), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|backend/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
