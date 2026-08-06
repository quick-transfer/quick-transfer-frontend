/**
 * Uses the Next.js proxy by default to keep backend topology out of the browser.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/backend";

/** Name of the HttpOnly cookie issued by the backend after authentication. */
export const AUTH_COOKIE_NAME = "JWT";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string | string[];
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const HTTP_ERROR_MESSAGES: Partial<Record<number, string>> = {
  500: "O servidor encontrou um erro interno. Tente novamente mais tarde.",
  502: "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.",
  503: "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.",
  504: "O servidor demorou demais para responder. Tente novamente em alguns minutos.",
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);
const CSRF_IGNORED_ENDPOINTS = new Set(["/auth/login", "/auth/first-access"]);

type CsrfResponse = {
  token: string;
  headerName?: string;
};

let csrfToken: string | null = null;
let csrfHeaderName = "X-XSRF-TOKEN";
let csrfRequest: Promise<string> | null = null;

function defaultErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status] || `Erro HTTP! Status: ${status}`;
}

function apiUrl(endpoint: string): string {
  return endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
}

function isFormData(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function errorMessageFromResponse(response: Response): Promise<string> {
  let errorMessage = defaultErrorMessage(response.status);

  try {
    const contentType = response.headers.get("content-type") || "";
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
      const errorText = (await response.text()).trim();
      if (errorText && errorText.length <= 500) {
        errorMessage = errorText;
      }
    }
  } catch {
    // Keep the status-based message if the response body is malformed.
  }

  return errorMessage;
}

async function loadCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) {
    csrfToken = null;
    csrfRequest = null;
  }

  if (csrfToken) return csrfToken;
  if (csrfRequest) return csrfRequest;

  csrfRequest = (async () => {
    let response: Response;

    try {
      response = await fetch(apiUrl("/auth/csrf"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new ApiError(
        "Não foi possível inicializar a sessão segura. Tente novamente.",
        0
      );
    }

    if (!response.ok) {
      throw new ApiError(
        await errorMessageFromResponse(response),
        response.status
      );
    }

    const payload = (await response.json()) as Partial<CsrfResponse>;
    if (!payload.token || typeof payload.token !== "string") {
      throw new ApiError("O servidor retornou um token de segurança inválido.", 502);
    }

    csrfHeaderName = payload.headerName || "X-XSRF-TOKEN";
    csrfToken = payload.token;
    return payload.token;
  })().finally(() => {
    csrfRequest = null;
  });

  return csrfRequest;
}

export function buildPageQuery(query: PageQuery = {}): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));

  const sortValues = Array.isArray(query.sort)
    ? query.sort
    : query.sort
      ? [query.sort]
      : [];
  for (const sort of sortValues) params.append("sort", sort);

  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export function pageContent<T>(response: PageResponse<T> | T[]): T[] {
  return Array.isArray(response) ? response : response.content;
}

/**
 * Central HTTP wrapper. Unsafe requests automatically bootstrap Spring's CSRF
 * token and retry once if that token expired. The token is read from the JSON
 * response instead of document.cookie so direct cross-origin deployments work.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return apiFetchInternal<T>(endpoint, options, false);
}

async function apiFetchInternal<T>(
  endpoint: string,
  options: RequestInit,
  csrfRetried: boolean
): Promise<T> {
  const url = apiUrl(endpoint);
  const method = (options.method || "GET").toUpperCase();
  const requiresCsrf =
    !SAFE_METHODS.has(method) && !CSRF_IGNORED_ENDPOINTS.has(endpoint);
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !isFormData(options.body)) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresCsrf) {
    const token = await loadCsrfToken(csrfRetried);
    headers.set(csrfHeaderName, token);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      method,
      headers,
      credentials: "include",
      cache: options.cache || "no-store",
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      0
    );
  }

  if (response.status === 403 && requiresCsrf && !csrfRetried) {
    return apiFetchInternal<T>(endpoint, options, true);
  }

  if (!response.ok) {
    throw new ApiError(await errorMessageFromResponse(response), response.status);
  }

  if (endpoint === "/auth/login" || endpoint === "/auth/logout") {
    csrfToken = null;
  }

  if (response.status === 204) {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
