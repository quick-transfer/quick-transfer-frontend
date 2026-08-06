import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const API_TARGET =
  process.env.API_PROXY_TARGET ||
  "http://localhost:8080/api";

const REQUEST_HEADERS_TO_REMOVE = [
  "connection",
  "content-length",
  "host",
  "origin",
];

// Mantém o contrato JSON da API mesmo quando a infraestrutura retorna uma página HTML.
function unavailableResponse(status = 503) {
  return Response.json(
    {
      message:
        status === 504
          ? "O servidor demorou demais para responder. Tente novamente em alguns minutos."
          : "O servidor está temporariamente indisponível. Tente novamente em alguns minutos.",
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function buildTargetUrl(request: NextRequest, path: string[]) {
  const base = API_TARGET.endsWith("/") ? API_TARGET : `${API_TARGET}/`;
  const targetUrl = new URL(path.map(encodeURIComponent).join("/"), base);
  targetUrl.search = request.nextUrl.search;
  return targetUrl;
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const headers = new Headers(request.headers);

  for (const header of REQUEST_HEADERS_TO_REMOVE) {
    headers.delete(header);
  }
  headers.set("accept-encoding", "identity");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let upstream: Response;

  try {
    upstream = await fetch(buildTargetUrl(request, path), {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
      // Evita que uma indisponibilidade do serviço deixe a requisição aberta indefinidamente.
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    return unavailableResponse(
      error instanceof DOMException && error.name === "TimeoutError" ? 504 : 503,
    );
  }

  const contentType = upstream.headers.get("content-type") || "";
  // A página de erro da hospedagem não deve ser repassada como mensagem para a interface.
  if (!upstream.ok && contentType.includes("text/html")) {
    return unavailableResponse(upstream.status >= 500 ? upstream.status : 502);
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  // The backend is mounted at /api and scopes XSRF-TOKEN to that path. From
  // the browser's perspective requests use /backend, so the original cookie
  // would never be sent back to this proxy. Re-scope only the cookie path;
  // security attributes (HttpOnly, SameSite, Secure, Max-Age) are preserved.
  const upstreamHeaders = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies = upstreamHeaders.getSetCookie?.()
    ?? (upstream.headers.get("set-cookie") ? [upstream.headers.get("set-cookie") as string] : []);
  if (setCookies.length > 0) {
    responseHeaders.delete("set-cookie");
    for (const cookie of setCookies) {
      responseHeaders.append(
        "set-cookie",
        cookie.replace(/Path=\/api(?=;|$)/gi, "Path=/"),
      );
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
