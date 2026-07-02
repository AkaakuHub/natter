import { HttpError } from "./http";

export interface AuthUser {
  id: string;
  discordId: string;
  name: string;
  image?: string;
  validated?: boolean;
  timestamp?: string;
}

interface JwtPayload extends AuthUser {
  exp?: number;
  iat?: number;
}

export async function signJwt(
  payload: AuthUser,
  secret: string,
): Promise<string> {
  if (!secret) {
    throw new HttpError(500, "JWT secret is not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + 30 * 24 * 60 * 60,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyJwt(
  token: string,
  secret: string,
): Promise<AuthUser> {
  if (!secret) {
    throw new HttpError(500, "JWT secret is not configured");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new HttpError(401, "Invalid JWT token");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = await hmacSha256(
    `${encodedHeader}.${encodedPayload}`,
    secret,
  );

  if (signature !== expectedSignature) {
    throw new HttpError(401, "Invalid JWT token");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as unknown;
  if (!isJwtPayload(payload)) {
    throw new HttpError(401, "Invalid JWT payload");
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new HttpError(401, "Invalid JWT token");
  }

  return {
    id: payload.id,
    discordId: payload.discordId,
    name: payload.name,
    image: payload.image,
    validated: payload.validated,
    timestamp: payload.timestamp,
  };
}

export async function optionalAuthUser(
  request: Request,
  secret: string,
): Promise<AuthUser | undefined> {
  const token = extractBearerToken(request);
  if (!token) {
    return undefined;
  }
  return verifyJwt(token, secret);
}

export async function requireAuthUser(
  request: Request,
  secret: string,
): Promise<AuthUser> {
  const token = extractBearerToken(request);
  if (!token) {
    throw new HttpError(401, "No token provided");
  }
  return verifyJwt(token, secret);
}

function extractBearerToken(request: Request): string | undefined {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return undefined;
  }
  const [type, token] = authorization.split(" ");
  return type === "Bearer" && token ? token : undefined;
}

async function hmacSha256(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function base64UrlEncode(value: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.discordId === "string" &&
    typeof record.name === "string" &&
    (record.image === undefined || typeof record.image === "string") &&
    (record.validated === undefined || typeof record.validated === "boolean") &&
    (record.timestamp === undefined || typeof record.timestamp === "string") &&
    (record.exp === undefined || typeof record.exp === "number") &&
    (record.iat === undefined || typeof record.iat === "number")
  );
}
