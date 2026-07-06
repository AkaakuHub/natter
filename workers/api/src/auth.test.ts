import { describe, expect, it } from "vitest";

import { requireAuthUser, requireSessionAuthUser } from "./auth";
import type { Env } from "./env";
import { HttpError } from "./http";

function createLocalHeaderEnv(): Env {
  let user: Record<string, unknown> | undefined;
  return {
    DB: {
      prepare: (sql: string) => ({
        bind: (...params: unknown[]) => ({
          first: async () => {
            if (sql.includes(`WHERE "discordId" = ?`)) {
              return user?.discordId === params[0] ? user : null;
            }
            if (sql.includes(`WHERE "id" = ?`)) {
              return user?.id === params[0] ? user : null;
            }
            return null;
          },
          run: async () => {
            if (sql.startsWith(`INSERT INTO "User"`)) {
              const now = String(params[6]);
              user = {
                id: params[0],
                name: params[1],
                tel: null,
                image: params[2],
                discordId: params[3],
                isAdmin: params[4],
                createdAt: now,
                updatedAt: now,
              };
            }
            if (sql.startsWith(`UPDATE "User"`)) {
              user = {
                ...user,
                name: params[0],
                image: params[1],
                isAdmin: params[2],
                updatedAt: params[3],
              };
            }
            return {} as D1Result;
          },
        }),
      }),
    } as D1Database,
    ASSETS: {} as R2Bucket,
    ACCOUNT_URL: "https://accounts.example.com",
    APP_ID: "app-id",
    APP_SESSION_HMAC_SECRET: "secret",
    SESSION_KID: "kid",
    AUTH_MODE: "local-header",
  };
}

describe("requireAuthUser local-header mode", () => {
  it("returns a local auth user from localhost development headers", async () => {
    await expect(
      requireAuthUser(
        new Request("http://localhost/posts", {
          headers: {
            "x-natter-dev-discord-id": "user-1",
            "x-natter-dev-name": "Alice",
            "x-natter-dev-image": "https://example.com/avatar.png",
          },
        }),
        createLocalHeaderEnv(),
      ),
    ).resolves.toEqual({
      id: "user-1",
      discordId: "user-1",
      name: "Alice",
      image: "https://example.com/avatar.png",
    });
  });

  it("uses default local user values when optional headers are missing", async () => {
    await expect(
      requireAuthUser(
        new Request("http://127.0.0.1/posts", {
          headers: {
            "x-natter-dev-discord-id": "user-1",
          },
        }),
        createLocalHeaderEnv(),
      ),
    ).resolves.toEqual({
      id: "user-1",
      discordId: "user-1",
      name: "Local Dev User",
      image: undefined,
    });
  });

  it("throws 401 when the local user header is missing", async () => {
    await expect(
      requireAuthUser(new Request("http://localhost/posts"), createLocalHeaderEnv()),
    ).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    } satisfies Partial<HttpError>);
  });

  it("throws 403 when local auth is used outside localhost", async () => {
    await expect(
      requireAuthUser(
        new Request("https://api.example.com/posts", {
          headers: { "x-natter-dev-discord-id": "user-1" },
        }),
        createLocalHeaderEnv(),
      ),
    ).rejects.toMatchObject({
      status: 403,
      message: "Local auth is only available on localhost",
    } satisfies Partial<HttpError>);
  });
});

describe("requireSessionAuthUser local-header mode", () => {
  it("returns a local auth user from localhost development headers", async () => {
    await expect(
      requireSessionAuthUser(
        new Request("http://localhost/posts/images/image.jpg", {
          headers: {
            "x-natter-dev-discord-id": "user-1",
            "x-natter-dev-name": "Alice",
            "x-natter-dev-image": "https://example.com/avatar.png",
          },
        }),
        createLocalHeaderEnv(),
      ),
    ).resolves.toEqual({
      id: "user-1",
      discordId: "user-1",
      name: "Alice",
      image: "https://example.com/avatar.png",
    });
  });

  it("throws 401 when the local user header is missing", async () => {
    await expect(
      requireSessionAuthUser(
        new Request("http://localhost/posts/images/image.jpg"),
        createLocalHeaderEnv(),
      ),
    ).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    } satisfies Partial<HttpError>);
  });
});
