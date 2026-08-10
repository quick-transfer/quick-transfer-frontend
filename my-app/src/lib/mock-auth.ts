import type { UserRole } from "@/types";

export type MockAuthenticatedUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};

/**
 * Fallback credentials for navigating the frontend while the API is down.
 * NEXT_PUBLIC_* variables are visible in the browser bundle — this access path
 * must never protect real data and must not replace backend auth/authz.
 */
export const MOCK_AUTH_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_MOCK_AUTH_USERNAME || "admin.mock",
  password: process.env.NEXT_PUBLIC_MOCK_AUTH_PASSWORD || "Mock@123456789!",
} as const;

/**
 * Mock mode is on by default in development so new contributors don't need
 * a running backend to start. In production it requires an explicit opt-in
 * and a new deploy — setting the env var at runtime alone is not enough
 * because Next.js bakes NEXT_PUBLIC_* values at build time.
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

/** Validates only the contingency user's credentials — real users never go through this path. */
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
 * Produces a token that satisfies the middleware's shape/expiry checks but is
 * deliberately invalid for the backend. The third segment (`mock-session-not-valid-for-backend`)
 * is not a real HMAC signature, so the backend will reject it if it ever reaches there —
 * preventing mock sessions from being mistaken for real ones.
 *
 * TTL is 8 hours to match a typical working day without requiring re-login.
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
