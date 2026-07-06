import { getAppSessionCookieHeader } from "@/auth";
import { buildBackendProxyHeaders } from "@/api/backendProxyHeaders";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE_URL = requireApiBaseUrl();

const forwardedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardApiRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardApiRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardApiRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardApiRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardApiRequest(request, context);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardApiRequest(request, context);
}

async function forwardApiRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  if (!forwardedMethods.includes(request.method)) {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const appSessionCookie = getAppSessionCookieHeader(request);
  const { path } = await context.params;
  const upstreamUrl = new URL(
    path.map(encodeURIComponent).join("/"),
    ensureTrailingSlash(API_BASE_URL),
  );
  upstreamUrl.search = request.nextUrl.search;

  const headers = buildBackendProxyHeaders(request.headers, appSessionCookie);

  const response = await fetch(upstreamUrl, {
    body: bodylessMethod(request.method) ? undefined : request.body,
    cache: "no-store",
    duplex: bodylessMethod(request.method) ? undefined : "half",
    headers,
    method: request.method,
    redirect: "manual",
  } as RequestInit);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  return new Response(response.body, {
    headers: responseHeaders,
    status: response.status,
    statusText: response.statusText,
  });
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function bodylessMethod(method: string): boolean {
  return method === "GET" || method === "HEAD";
}

function requireApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) {
    throw new Error("NEXT_PUBLIC_API_URL is required");
  }
  return value;
}
