/**
 * Base URL do Backend Spring Boot.
 * Pode ser sobrescrito via variável de ambiente NEXT_PUBLIC_API_URL.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Nome do cookie de autenticação JWT definido pelo backend Spring Boot.
 */
export const AUTH_COOKIE_NAME = "authToken";

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
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      }
    } catch {
      // Caso a resposta de erro não seja JSON
    }
    throw new Error(errorMessage);
  }

  // Tratamento para respostas sem conteúdo (204 No Content por exemplo)
  if (response.status === 204) {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
