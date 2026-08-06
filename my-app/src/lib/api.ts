/**
 * Uses the Next.js proxy by default to avoid CORS and avoid exposing the
 * backend address in the browser. Can be overridden via NEXT_PUBLIC_API_URL
 * for deployments that talk directly to the backend.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/backend";

/** Name of the HttpOnly cookie issued by the backend after authentication. */
export const AUTH_COOKIE_NAME = "JWT";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

/**
 * The Spring endpoints expose their `find/all` and `search` results as a
 * `Page<T>`. Older deployments returned a plain array, so accepting both
 * shapes keeps the client compatible during backend rollouts.
 */
export function unwrapCollection<T>(payload: T[] | ApiPage<T>): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.content)) return payload.content;
  return [];
}

// Static messages prevent internal infrastructure details from leaking into the UI.
// 502/503 share a message intentionally — from the user's perspective the distinction
// between "gateway bad" and "service unavailable" is meaningless.
const HTTP_ERROR_MESSAGES: Partial<Record<number, string>> = {
  500: "O servidor encontrou um erro interno. Tente novamente mais tarde.",
  502: "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.",
  503: "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.",
  504: "O servidor demorou demais para responder. Tente novamente em alguns minutos.",
};

function defaultErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status] || `Erro HTTP! Status: ${status}`;
}

interface CsrfTokenResponse {
  headerName: string;
  token: string;
}

function isMutation(method: string) {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

async function getCsrfToken(): Promise<CsrfTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  }).catch(() => {
    throw new ApiError('Não foi possível obter a proteção CSRF do servidor.', 0);
  });

  if (!response.ok) {
    throw new ApiError(defaultErrorMessage(response.status), response.status);
  }

  const payload = await response.json() as Partial<CsrfTokenResponse>;
  if (!payload.headerName || !payload.token) {
    throw new ApiError('O servidor não retornou um token CSRF válido.', 502);
  }

  return { headerName: payload.headerName, token: payload.token };
}

/**
 * Centralised HTTP wrapper for all Spring Boot API calls.
 *
 * Always sends `credentials: "include"` so the browser attaches and receives
 * the HttpOnly JWT cookie on every request — this is required by the backend
 * session model and must not be removed.
 *
 * FormData bodies are excluded from the automatic Content-Type injection
 * because the browser must set it itself (with the correct multipart boundary).
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const method = (options.method || 'GET').toUpperCase();
  const csrfProtected = isMutation(method) && endpoint !== '/auth/csrf';

  if (csrfProtected) {
    // Always read a token immediately before an unsafe request. Besides sending
    // the XSRF cookie, this prevents a token cached before a login/session
    // rotation from being paired with the current JWT cookie.
    const csrf = await getCsrfToken();
    headers.set(csrf.headerName, csrf.token);
  }

  let response: Response;

  const send = () => fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });

  try {
    response = await send();
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      // Status 0 signals a network-level failure (no HTTP response at all).
      0
    );
  }

  if (!response.ok) {
    let errorMessage = defaultErrorMessage(response.status);
    try {
      // Keep infrastructure failures on the safe, localized messages above.
      // Backend 5xx bodies may expose internal details and are not actionable.
      if (response.status >= 500) {
        throw new Error('skip-server-error-body');
      }
      const contentType = response.headers.get("content-type") || "";
      // The API uses { message }, but short plain-text responses are also accepted.
      // HTML is ignored to avoid rendering entire Spring error pages in the UI.
      if (contentType.includes("application/json")) {
        const errorData: unknown = await response.json();
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          "message" in errorData &&
          typeof errorData.message === "string" &&
          errorData.message.trim()
        ) {
          errorMessage = errorData.message;
        }
      } else if (contentType.includes("text/plain")) {
        // Length guard prevents truncated 50 KB server-generated text pages from reaching users.
        const errorText = (await response.text()).trim();
        if (errorText && errorText.length <= 500) {
          errorMessage = errorText;
        }
      }
    } catch {
      // Parsing the error body itself failed — fall through to the default message.
    }

    throw new ApiError(errorMessage, response.status);
  }

  // 204 No Content — return an empty object typed as T rather than trying to parse
  // an empty body (which would throw a JSON parse error).
  if (response.status === 204) {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    // Body was unexpectedly empty or non-JSON on a 2xx response — safe to swallow.
    return {} as T;
  }
}

export async function apiFetchCollection<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T[]> {
  const payload = await apiFetch<T[] | ApiPage<T>>(endpoint, options);
  return unwrapCollection(payload);
}
