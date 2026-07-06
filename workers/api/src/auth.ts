import {
  getLinkAuthSessionUser,
  getLinkAuthUser,
  loadLinkAuthAppConfig,
  type LinkAuthUser,
} from "link-auth";
import { firstRow, requireRow, run } from "./db";
import type { Env } from "./env";
import { HttpError } from "./http";
import { parseUser, type User } from "./models";

export type AuthUser = {
  id: string;
  discordId: string;
  name: string;
  image?: string;
};

export async function requireAuthUser(
  request: Request,
  env: Env,
): Promise<AuthUser> {
  const authUser = await authenticateConfiguredAuthUser(request, env);
  if (!authUser) {
    throw new HttpError(401, "Unauthorized");
  }
  return authUser;
}

export async function requireSessionAuthUser(
  request: Request,
  env: Env,
): Promise<AuthUser> {
  const authUser = await authenticateConfiguredSessionAuthUser(request, env);
  if (!authUser) {
    throw new HttpError(401, "Unauthorized");
  }
  return authUser;
}

async function authenticateConfiguredAuthUser(
  request: Request,
  env: Env,
): Promise<AuthUser | undefined> {
  if (env.AUTH_MODE === "link-auth") {
    return authenticateLinkAuthUser(request, env);
  }
  if (env.AUTH_MODE === "local-header") {
    return authenticateLocalHeaderUser(request, env);
  }
  throw new HttpError(500, "Invalid auth mode");
}

async function authenticateConfiguredSessionAuthUser(
  request: Request,
  env: Env,
): Promise<AuthUser | undefined> {
  if (env.AUTH_MODE === "link-auth") {
    return authenticateLinkAuthSessionUser(request, env);
  }
  if (env.AUTH_MODE === "local-header") {
    return authenticateLocalHeaderUser(request, env);
  }
  throw new HttpError(500, "Invalid auth mode");
}

async function authenticateLocalHeaderUser(
  request: Request,
  env: Env,
): Promise<AuthUser | undefined> {
  const url = new URL(request.url);
  if (!isLocalHostname(url.hostname)) {
    throw new HttpError(403, "Local auth is only available on localhost");
  }
  const discordId = request.headers.get("x-natter-dev-discord-id");
  if (!discordId) {
    return undefined;
  }
  const user = await upsertAuthUser(env.DB, {
    discordId,
    name: request.headers.get("x-natter-dev-name") ?? "Local Dev User",
    image: request.headers.get("x-natter-dev-image"),
    isAdmin: true,
  });
  return authUserFromUser(user);
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

async function authenticateLinkAuthUser(
  request: Request,
  env: Env,
): Promise<AuthUser | undefined> {
  const linkAuthUser = await getLinkAuthUser({
    config: loadLinkAuthAppConfig(env),
    request,
  });
  if (!linkAuthUser) {
    return undefined;
  }
  return upsertLinkAuthUser(linkAuthUser, env);
}

async function authenticateLinkAuthSessionUser(
  request: Request,
  env: Env,
): Promise<AuthUser | undefined> {
  const linkAuthUser = await getLinkAuthSessionUser({
    config: loadLinkAuthAppConfig(env),
    request,
  });
  if (!linkAuthUser) {
    return undefined;
  }
  return upsertLinkAuthUser(linkAuthUser, env);
}

async function upsertLinkAuthUser(
  linkAuthUser: LinkAuthUser,
  env: Env,
): Promise<AuthUser> {
  const user = await upsertAuthUser(env.DB, {
    discordId: linkAuthUser.discord_id,
    name: linkAuthUser.display_name,
    image: linkAuthUser.avatar_url,
    isAdmin: linkAuthUser.role === "admin",
  });
  return authUserFromUser(user);
}

type UpsertAuthUserInput = {
  discordId: string;
  name: string;
  image: string | null;
  isAdmin: boolean;
};

async function upsertAuthUser(
  db: D1Database,
  input: UpsertAuthUserInput,
): Promise<User> {
  const existing = await findUserByDiscordId(db, input.discordId);
  const now = new Date().toISOString();
  if (existing) {
    await run(
      db,
      `UPDATE "User" SET "name" = ?, "image" = ?, "isAdmin" = ?, "updatedAt" = ? WHERE "discordId" = ?`,
      input.name,
      input.image,
      input.isAdmin,
      now,
      input.discordId,
    );
    return requireRow(
      await getUserRowById(db, existing.id),
      parseUser,
      "User not found",
    );
  }

  await run(
    db,
    `INSERT INTO "User" ("id", "name", "tel", "image", "discordId", "isAdmin", "createdAt", "updatedAt")
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
    input.discordId,
    input.name,
    input.image,
    input.discordId,
    input.isAdmin,
    now,
    now,
  );
  return requireRow(
    await getUserRowById(db, input.discordId),
    parseUser,
    "User not found",
  );
}

function authUserFromUser(user: User): AuthUser {
  return {
    id: user.id,
    discordId: user.discordId,
    name: user.name,
    image: user.image ?? undefined,
  };
}

async function findUserByDiscordId(
  db: D1Database,
  discordId: string,
): Promise<User | undefined> {
  const row = await firstRow(
    db,
    `SELECT * FROM "User" WHERE "discordId" = ?`,
    discordId,
  );
  return row ? parseUser(row) : undefined;
}

async function getUserRowById(
  db: D1Database,
  id: string,
): Promise<Record<string, unknown> | undefined> {
  return firstRow(db, `SELECT * FROM "User" WHERE "id" = ?`, id);
}
