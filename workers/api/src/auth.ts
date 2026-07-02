import {
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
  const authUser = await authenticateLinkAuthUser(request, env);
  if (!authUser) {
    throw new HttpError(401, "Unauthorized");
  }
  return authUser;
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
  const user = await upsertAuthenticatedUser(env.DB, linkAuthUser);
  return {
    id: user.id,
    discordId: user.discordId,
    name: user.name,
    image: user.image ?? undefined,
  };
}

async function upsertAuthenticatedUser(
  db: D1Database,
  linkAuthUser: LinkAuthUser,
): Promise<User> {
  const existing = await findUserByDiscordId(db, linkAuthUser.discord_id);
  const now = new Date().toISOString();
  const isAdmin = linkAuthUser.role === "admin";
  if (existing) {
    await run(
      db,
      `UPDATE "User" SET "name" = ?, "image" = ?, "isAdmin" = ?, "updatedAt" = ? WHERE "discordId" = ?`,
      linkAuthUser.display_name,
      linkAuthUser.avatar_url,
      isAdmin,
      now,
      linkAuthUser.discord_id,
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
    linkAuthUser.discord_id,
    linkAuthUser.display_name,
    linkAuthUser.avatar_url,
    linkAuthUser.discord_id,
    isAdmin,
    now,
    now,
  );
  return requireRow(
    await getUserRowById(db, linkAuthUser.discord_id),
    parseUser,
    "User not found",
  );
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
