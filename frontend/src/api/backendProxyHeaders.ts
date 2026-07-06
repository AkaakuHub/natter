import { applyLocalHeaderAuth } from "@/auth";

const removedForwardHeaders = [
  "host",
  "cookie",
  "content-length",
  "authorization",
  "x-natter-dev-discord-id",
  "x-natter-dev-name",
  "x-natter-dev-image",
] as const;

export function buildBackendProxyHeaders(
  requestHeaders: Headers,
  appSessionCookie: string | null,
): Headers {
  const headers = new Headers(requestHeaders);
  for (const header of removedForwardHeaders) {
    headers.delete(header);
  }
  if (appSessionCookie) {
    headers.set("cookie", appSessionCookie);
  }
  applyLocalHeaderAuth(headers);
  return headers;
}
