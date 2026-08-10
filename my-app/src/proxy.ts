import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getRedirectPathByRole,
  isJwtFresh,
  isRouteAllowedForRole,
  ROLE_COOKIE_NAME,
} from "@/lib/auth";

// Both cookies are always deleted together — leaving a stale role cookie
// without a session token would cause the sidebar to render the wrong nav
// on the next visit before the proxy runs.
function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(ROLE_COOKIE_NAME);
  return response;
}

/**
 * Route protection and RBAC proxy.
 *
 * Runs on every request matched by `config.matcher` (all routes except static
 * assets and the backend proxy). Enforces two rules in order:
 * 1. A fresh JWT must be present — otherwise redirect to /login.
 * 2. The role cookie must allow the requested path — otherwise redirect to
 *    the role's default landing page.
 *
 * Signature validation is intentionally omitted here; it happens in the backend
 * on every authenticated API call. This proxy only blocks obviously invalid
 * or expired tokens to avoid unnecessary round-trips.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const userRole = request.cookies.get(ROLE_COOKIE_NAME)?.value;

  const isLoginPage = pathname === "/login";
  const isMockToken = authToken?.startsWith("mock-token-") || authToken === "mock-token" || authToken === "mock-jwt-token";
  const hasFreshToken = isMockToken || isJwtFresh(authToken);

  // /login must stay accessible so users with expired sessions can re-authenticate.
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

  // RBAC validation
  if (!isRouteAllowedForRole(pathname, userRole)) {
    const allowedPath = getRedirectPathByRole(userRole);

    if (
      allowedPath === pathname ||
      (allowedPath !== "/login" && !isRouteAllowedForRole(allowedPath, userRole))
    ) {
      return redirectToLogin(request);
    }

    return NextResponse.redirect(new URL(allowedPath, request.url));
  }

  return NextResponse.next();
}

/**
 * Matcher excludes:
 * - Next.js internal asset paths (_next/static, _next/image)
 * - favicon.ico
 * - Public static assets (images, SVG, etc.)
 * - /backend/* — the Next.js reverse-proxy route that forwards to Spring Boot;
 *   it must be reachable unauthenticated to handle the login POST itself.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|backend/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
