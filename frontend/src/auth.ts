import {
  getLinkAuthSessionUser,
  getLinkAuthUser,
  handleAppAuthRequest,
  loadLinkAuthAppConfig,
  type LinkAuthUser,
} from "link-auth";

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

export async function getAuthSession(request: Request): Promise<AuthSession | null> {
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

export async function handleAuthRoute(request: Request): Promise<Response> {
  return await handleAppAuthRequest({
    authFailedResponse: (url) =>
      Response.redirect(new URL("/login?error=AuthFailed", url.origin), 302),
    config: loadAuthConfig(),
    handleRequest: ({ url }) => Response.redirect(new URL("/", url.origin), 302),
    loginResponse: (request) =>
      Response.redirect(new URL("/_auth/account", request.url), 302),
    request,
  });
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
