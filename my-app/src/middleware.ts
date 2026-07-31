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
  const hasFreshToken = isJwtFresh(authToken);

  // A tela de login deve continuar acessível para permitir a recuperação de
  // sessões inválidas. Cookies malformados ou expirados são removidos.
  if (isLoginPage) {
    const response = NextResponse.next();
    if (authToken && !hasFreshToken) {
      response.cookies.delete(AUTH_COOKIE_NAME);
      response.cookies.delete(ROLE_COOKIE_NAME);
    }
    return response;
  }

  // Um cookie presente não basta: ele também precisa ter formato JWT e não
  // estar expirado. A assinatura será validada pelo backend em cada requisição.
  if (!hasFreshToken) {
    return redirectToLogin(request);
  }

  // Validação de RBAC (Role-Based Access Control) para usuários autenticados
  // Se tentar acessar uma rota não permitida para o seu papel (ex: ALUNO em /admin),
  // redireciona para a rota inicial permitida do seu perfil
  if (!isRouteAllowedForRole(pathname, userRole)) {
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
