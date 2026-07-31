import type { UserRole } from "@/types";

export type MockAuthenticatedUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};

/**
 * Credenciais de contingência para navegar no frontend enquanto a API estiver fora do ar.
 * Como variáveis NEXT_PUBLIC são visíveis no navegador, este acesso nunca deve proteger
 * dados reais nem substituir a autenticação e a autorização feitas pelo backend.
 */
export const MOCK_AUTH_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_MOCK_AUTH_USERNAME || "admin.mock",
  password: process.env.NEXT_PUBLIC_MOCK_AUTH_PASSWORD || "Mock@123456789!",
} as const;

/**
 * Em desenvolvimento o modo mock fica disponível por padrão. Em produção ele exige a
 * configuração explícita NEXT_PUBLIC_ENABLE_MOCK_AUTH=true e um novo deploy.
 */
export const IS_MOCK_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH !== "false");

const MOCK_ADMIN: MockAuthenticatedUser = {
  id: "mock-admin-1",
  name: "Administrador Mock",
  username: MOCK_AUTH_CREDENTIALS.username,
  role: "ADMIN",
};

/** Valida exclusivamente as credenciais do usuário de contingência. */
export function authenticateMockUser(
  username: string,
  password: string
): MockAuthenticatedUser | null {
  if (!IS_MOCK_AUTH_ENABLED) return null;

  const credentialsMatch =
    username === MOCK_AUTH_CREDENTIALS.username &&
    password === MOCK_AUTH_CREDENTIALS.password;

  return credentialsMatch ? MOCK_ADMIN : null;
}

function encodeBase64Url(value: object): string {
  return btoa(JSON.stringify(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Cria um token apenas com o formato esperado pelo middleware do frontend.
 * A assinatura propositalmente inválida impede que ele seja confundido com uma
 * sessão real caso seja enviado ao backend.
 */
export function createMockSessionToken(user: MockAuthenticatedUser): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url({ alg: "none", typ: "JWT" });
  const payload = encodeBase64Url({
    sub: user.id,
    username: user.username,
    role: user.role,
    iat: issuedAt,
    exp: issuedAt + 60 * 60 * 8,
    mock: true,
  });

  return `${header}.${payload}.mock-session-not-valid-for-backend`;
}
