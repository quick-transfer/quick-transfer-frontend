import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/api";
import { getRedirectPathByRole, isRouteAllowedForRole, ROLE_COOKIE_NAME } from "@/lib/auth";

/**
 * Middleware de Proteção de Rotas e RBAC.
 * Verifica a presença do cookie de autenticação HttpOnly e autorizações por perfil (UserRole).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtém o cookie de autenticação JWT e o perfil do usuário enviado pela requisição
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const userRole = request.cookies.get(ROLE_COOKIE_NAME)?.value;

  const isLoginPage = pathname === "/login";

  // Se o usuário estiver na rota /login e possuir um cookie de sessão válido,
  // redireciona-o para a rota inicial padrão correspondente ao seu perfil (RBAC)
  if (isLoginPage && authToken) {
    const defaultRoute = getRedirectPathByRole(userRole);
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  // Se o usuário não possuir cookie de sessão válido e tentar acessar uma rota protegida,
  // redireciona-o imediatamente para a página de login
  if (!isLoginPage && !authToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validação de RBAC (Role-Based Access Control) para usuários autenticados
  // Se tentar acessar uma rota não permitida para o seu papel (ex: ALUNO em /admin),
  // redireciona para a rota inicial permitida do seu perfil
  if (authToken && !isLoginPage && !isRouteAllowedForRole(pathname, userRole)) {
    const allowedPath = getRedirectPathByRole(userRole);
    return NextResponse.redirect(new URL(allowedPath, request.url));
  }

  return NextResponse.next();
}

/**
 * Configuração do matcher para definir as rotas auditadas pelo middleware.
 */
export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas de requisição, exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do navegador)
     * - imagens e recursos públicos (svg, png, jpg, jpeg, gif, webp, ico)
     * - rotas públicas de API (/api/public por exemplo, caso existam)
     */
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
