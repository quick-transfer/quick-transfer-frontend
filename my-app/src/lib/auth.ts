import { UserRole } from "@/types";

/**
 * Authentication JWT session cookie name.
 */
export const AUTH_COOKIE_NAME = "authToken";

/**
 * User role cookie name.
 */
export const ROLE_COOKIE_NAME = "userRole";

/**
 * Checks only whether a JWT has a valid shape and has not expired.
 * This is used exclusively for frontend routing; the backend remains
 * responsible for validating the token signature and authorization.
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
      payload.exp * 1000 > Date.now()
    );
  } catch {
    return false;
  }
}

/**
 * Returns default initial route by role (RBAC).
 */
export function getRedirectPathByRole(role?: UserRole | string | null): string {
  if (!role) return "/dashboard";

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
      return "/dashboard";
  }
}

/**
 * Determines whether a route is permitted for a specific user role.
 */
export function isRouteAllowedForRole(pathname: string, role?: UserRole | string | null): boolean {
  if (!role) return true;

  const normalizedRole = role.toUpperCase();

  // ADMIN has access to everything
  if (normalizedRole === "ADMIN") return true;

  // ADMIN exclusive routes
  if (pathname.startsWith("/admin")) {
    return false;
  }

  // MANAGER routes
  if (pathname.startsWith("/manager")) {
    return normalizedRole === "MANAGER" || normalizedRole === "GESTOR";
  }

  // Coordinator routes (/dashboard, /shifts, /classes, /students, /courses, /coordinator)
  const coordinatorRoutes = ["/dashboard", "/shifts", "/classes", "/students", "/courses", "/coordinator"];
  if (coordinatorRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return normalizedRole === "COORDINATOR" || normalizedRole === "COORDENADOR";
  }

  return true;
}

