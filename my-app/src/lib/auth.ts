import { UserRole } from "@/types";

/**
 * Nome do cookie de autenticação JWT/sessão principal.
 */
export const AUTH_COOKIE_NAME = "authToken";

/**
 * Nome do cookie de role do usuário.
 */
export const ROLE_COOKIE_NAME = "userRole";

/**
 * Retorna a rota inicial padrão permitida para cada perfil (RBAC).
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
      return "/gestor/vagas";
    case "STUDENT":
    case "ALUNO":
      return "/aluno/entrevistas";
    default:
      return "/dashboard";
  }
}

/**
 * Define se uma rota é permitida para uma determinada role.
 */
export function isRouteAllowedForRole(pathname: string, role?: UserRole | string | null): boolean {
  if (!role) return true;

  const normalizedRole = role.toUpperCase();

  // Rotas exclusivas de ADMIN
  if (pathname.startsWith("/admin")) {
    return normalizedRole === "ADMIN";
  }

  // Rotas de GESTOR
  if (pathname.startsWith("/gestor")) {
    return normalizedRole === "MANAGER" || normalizedRole === "GESTOR" || normalizedRole === "ADMIN";
  }

  // Rotas de ALUNO
  if (pathname.startsWith("/aluno")) {
    return normalizedRole === "STUDENT" || normalizedRole === "ALUNO" || normalizedRole === "ADMIN";
  }

  // Rotas de Coordenador (/dashboard, /turnos, /turmas, /alunos, /solicitacoes)
  const coordinatorRoutes = ["/dashboard", "/turnos", "/turmas", "/alunos", "/solicitacoes"];
  if (coordinatorRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return normalizedRole === "COORDINATOR" || normalizedRole === "COORDENADOR" || normalizedRole === "ADMIN";
  }

  return true;
}
