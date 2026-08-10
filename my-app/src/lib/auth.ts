import { UserRole } from "@/types";

/**
 * Authentication JWT session cookie name.
 * Must match the name the Spring Boot backend uses when issuing the HttpOnly cookie.
 */
export const AUTH_COOKIE_NAME = "JWT";

/**
 * User role cookie name.
 * Written client-side after login so the Next.js middleware can read it during SSR
 * (HttpOnly cookies are invisible to JS, so the role needs its own readable cookie).
 */
export const ROLE_COOKIE_NAME = "userRole";

export const USER_ID_COOKIE_NAME = 'userId';
export const USER_NAME_COOKIE_NAME = 'userName';

/**
 * Checks only whether a JWT has a valid shape and has not expired.
 * Intentionally does NOT verify the signature — that is the backend's responsibility
 * on every authenticated request. This function is used only for frontend routing
 * to avoid unnecessary round-trips for obviously stale tokens.
 *
 * Uses Base64URL decoding (RFC 7515 §2) because browsers' `atob` expects standard
 * Base64; the `-` → `+` and `_` → `/` replacements plus padding are required.
 */
export function isJwtFresh(token?: string | null): boolean {
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const normalizedPayload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const payload: unknown = JSON.parse(atob(normalizedPayload));

    return (
      typeof payload === "object" &&
      payload !== null &&
      "exp" in payload &&
      typeof payload.exp === "number" &&
      // `exp` is in seconds; Date.now() is in ms.
      payload.exp * 1000 > Date.now()
    );
  } catch {
    // Malformed token — treat as expired.
    return false;
  }
}

/**
 * Returns the landing route for a given role after login or an unauthorized redirect.
 * Defaults to `/dashboard` when the role is unknown, rather than blocking the user.
 */
export function getRedirectPathByRole(role?: UserRole | string | null): string {
  if (!role) return "/login";

  const normalizedRole = role.toUpperCase();

  switch (normalizedRole) {
    case "ADMIN":
      return "/admin";
    case "COORDINATOR":
    case "COORDENADOR":
      return "/dashboard";
    case "MANAGER":
    case "GESTOR":
      return "/manager/vacancies";
    default:
      // Um papel desconhecido não possui rota inicial. Enviá-lo para /dashboard
      // criava um loop, pois essa rota é exclusiva do coordenador.
      return "/login";
  }
}

/**
 * Determines whether a pathname is accessible for a given role.
 *
 * Rules (in evaluation order):
 * 1. No role cookie → allow through (middleware hasn't set it yet, backend will enforce).
 * 2. ADMIN → unrestricted.
 * 3. /admin/* → ADMIN-only; any other role is denied.
 * 4. /manager/* → MANAGER only.
 * 5. Coordinator routes → COORDINATOR only.
 * 6. Anything else (e.g. shared utilities) → allow.
 *
 * Note: Portuguese aliases (COORDENADOR, GESTOR) are accepted because the backend
 * may return either form depending on the API version.
 */
export function isRouteAllowedForRole(pathname: string, role?: UserRole | string | null): boolean {
  if (!role) return true;

  const normalizedRole = role.toUpperCase();

  // ADMIN can access everything
  if (normalizedRole === "ADMIN") {
    return true;
  }

  if (pathname.startsWith("/admin")) {
    return false;
  }

  if (pathname.startsWith("/manager")) {
    return normalizedRole === "MANAGER" || normalizedRole === "GESTOR";
  }

  const coordinatorRoutes = ["/dashboard", "/classes", "/students", "/courses", "/coordinator"];
  if (coordinatorRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return normalizedRole === "COORDINATOR" || normalizedRole === "COORDENADOR";
  }

  return true;
}
