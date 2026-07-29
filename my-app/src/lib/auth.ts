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
    case "STUDENT":
    case "ALUNO":
      return "/student/interviews";
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

  // ADMIN exclusive routes
  if (pathname.startsWith("/admin")) {
    return normalizedRole === "ADMIN";
  }

  // MANAGER routes
  if (pathname.startsWith("/manager")) {
    return normalizedRole === "MANAGER" || normalizedRole === "GESTOR" || normalizedRole === "ADMIN";
  }

  // STUDENT routes
  if (pathname.startsWith("/student")) {
    return normalizedRole === "STUDENT" || normalizedRole === "ALUNO" || normalizedRole === "ADMIN";
  }

  // Coordinator routes (/dashboard, /shifts, /classes, /students, /requests)
  const coordinatorRoutes = ["/dashboard", "/shifts", "/classes", "/students", "/requests"];
  if (coordinatorRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return normalizedRole === "COORDINATOR" || normalizedRole === "COORDENADOR" || normalizedRole === "ADMIN";
  }

  return true;
}
