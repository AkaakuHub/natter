import {
  getLinkAuthSessionUser,
  getLinkAuthSessionToken,
  getLinkAuthSessionCookieName,
  getLinkAuthUser,
  handleAppAuthRequest,
  loadLinkAuthAppConfig,
  type LinkAuthUser,
} from "link-auth";
import { noStoreHeaders } from "./http/noStoreHeaders";

export type AuthSession = {
  user: {
    id: string;
    name: string;
    image?: string;
  };
};

export function loadAuthConfig() {
  return loadLinkAuthAppConfig({
    ACCOUNT_URL: requireEnv("ACCOUNT_URL"),
    APP_ID: requireEnv("APP_ID"),
    APP_SESSION_HMAC_SECRET: requireEnv("APP_SESSION_HMAC_SECRET"),
    SESSION_KID: requireEnv("SESSION_KID"),
  });
}

export async function getAuthSession(
  request: Request,
): Promise<AuthSession | null> {
  const user = await getLinkAuthUser({
    config: loadAuthConfig(),
    request,
  });
  return user ? authSessionFromLinkAuthUser(user) : null;
}

export async function getLocalAuthSession(
  request: Request,
): Promise<AuthSession | null> {
  const user = await getLinkAuthSessionUser({
    config: loadAuthConfig(),
    request,
  });
  return user ? authSessionFromLinkAuthUser(user) : null;
}

export function getAppSessionToken(request: Request): string | null {
  return getLinkAuthSessionToken({
    config: loadAuthConfig(),
    request,
  });
}

export function getAppSessionCookieHeader(request: Request): string | null {
  const token = getAppSessionToken(request);
  if (!token) {
    return null;
  }
  return `${getLinkAuthSessionCookieName(loadAuthConfig().appId)}=${encodeURIComponent(token)}`;
}

export async function handleAuthRoute(request: Request): Promise<Response> {
  return await handleAppAuthRequest({
    authFailedResponse: (url) =>
      noStoreRedirect(new URL("/login?error=AuthFailed", url.origin)),
    config: loadAuthConfig(),
    handleRequest: ({ url }) => noStoreRedirect(new URL("/", url.origin)),
    loginResponse: (request) =>
      noStoreRedirect(new URL("/_auth/account", request.url)),
    request: normalizeLinkAuthRouteRequest(request),
  });
}

export function withLinkAuthRoutePath(
  request: Request,
  pathname: string,
): Request {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

function authSessionFromLinkAuthUser(user: LinkAuthUser): AuthSession {
  return {
    user: {
      id: user.discord_id,
      name: user.display_name,
      image: user.avatar_url ?? undefined,
    },
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function normalizeLinkAuthRouteRequest(request: Request): Request {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/%5Fauth/")) {
    return request;
  }
  url.pathname = url.pathname.replace(/^\/%5Fauth\//, "/_auth/");
  return new Request(url, request);
}

function noStoreRedirect(url: URL): Response {
  return new Response(null, {
    headers: {
      Location: url.toString(),
      ...noStoreHeaders,
    },
    status: 302,
  });
}
