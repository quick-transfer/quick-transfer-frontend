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

// Mensagens estáveis impedem que detalhes internos da infraestrutura apareçam na interface.
const HTTP_ERROR_MESSAGES: Partial<Record<number, string>> = {
  500: "O servidor encontrou um erro interno. Tente novamente mais tarde.",
  502: "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.",
  503: "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.",
  504: "O servidor demorou demais para responder. Tente novamente em alguns minutos.",
};

function defaultErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status] || `Erro HTTP! Status: ${status}`;
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

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      // Garantindo o envio e recebimento dos cookies HttpOnly no navegador
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      0,
    );
  }

  if (!response.ok) {
    let errorMessage = defaultErrorMessage(response.status);
    try {
      const contentType = response.headers.get("content-type") || "";
      // A API usa { message }, mas respostas textuais curtas também são aceitas.
      // HTML é ignorado para não exibir páginas inteiras de erro ao usuário.
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
