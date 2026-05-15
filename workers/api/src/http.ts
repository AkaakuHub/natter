import type { Env } from "./env";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function jsonResponse(
  env: Env,
  request: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env, request),
    },
  });
}

export function emptyResponse(
  env: Env,
  request: Request,
  status = 204,
): Response {
  return new Response(null, {
    status,
    headers: corsHeaders(env, request),
  });
}

export function errorResponse(
  env: Env,
  request: Request,
  error: unknown,
): Response {
  if (error instanceof HttpError) {
    return jsonResponse(env, request, { message: error.message }, error.status);
  }

  const message = error instanceof Error ? error.message : "Internal error";
  return jsonResponse(env, request, { message }, 500);
}

export function corsHeaders(env: Env, request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  const allowedOrigins = (env.FRONTEND_URLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    ...(allowOrigin ? { "Access-Control-Allow-Origin": allowOrigin } : {}),
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  };
}

export async function readJsonObject(request: Request): Promise<JsonObject> {
  const value = (await request.json()) as unknown;
  if (!isJsonObject(value)) {
    throw new HttpError(400, "Request body must be an object");
  }
  return value;
}

export type JsonObject = Record<string, unknown>;

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function getBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}

export function getInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function requireString(value: unknown, name: string): string {
  const parsed = getString(value);
  if (!parsed) {
    throw new HttpError(400, `${name} is required`);
  }
  return parsed;
}

export function parseLimit(value: string | null, defaultValue: number): number {
  if (!value) {
    return defaultValue;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new HttpError(400, "Invalid limit");
  }
  return parsed;
}

export function parseId(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new HttpError(400, "Invalid id");
  }
  return parsed;
}
