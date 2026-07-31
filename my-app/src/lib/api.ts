export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const AUTH_COOKIE_NAME = "authToken";

// 1. Criando a classe ApiError
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

function defaultErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status] || `Erro HTTP! Status: ${status}`;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      0
    );
  }

  if (!response.ok) {
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
      // Ignora erro de parsing da resposta de erro
    }

    // 2. Usando ApiError consistentemente com o status da resposta HTTP
    throw new ApiError(errorMessage, response.status);
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