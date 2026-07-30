/**
 * Base URL do Backend Spring Boot.
 * Pode ser sobrescrito via variável de ambiente NEXT_PUBLIC_API_URL.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/backend";

/**
 * Nome do cookie de autenticação JWT definido pelo backend Spring Boot.
 */
export const AUTH_COOKIE_NAME = "JWT";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Função utilitária centralizada para realizar requisições HTTP para a API Spring Boot.
 * Por padrão, define `credentials: "include"` em todas as chamadas para que o navegador
 * envie e receba cookies com a flag HttpOnly.
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

  const response = await fetch(url, {
    ...options,
    headers,
    // Garantindo o envio e recebimento dos cookies HttpOnly no navegador
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = `Erro HTTP! Status: ${response.status}`;
    try {
      const contentType = response.headers.get("content-type") || "";
      const errorData = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData
      ) {
        errorMessage = errorData.message;
      } else if (typeof errorData === "string") {
        errorMessage = errorData || errorMessage;
      }
    } catch {
      // Caso a resposta de erro não seja JSON
    }
    throw new ApiError(errorMessage, response.status);
  }

  // Tratamento para respostas sem conteúdo (204 No Content por exemplo)
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
