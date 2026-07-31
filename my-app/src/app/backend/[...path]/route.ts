import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const API_TARGET =
  process.env.API_PROXY_TARGET || "http://localhost:8080/api";

const REQUEST_HEADERS_TO_REMOVE = [
  "connection",
  "content-length",
  "host",
  "origin",
];

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
  const upstream = await fetch(buildTargetUrl(request, path), {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

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
