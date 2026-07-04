import { describe, expect, it } from "vitest";

import { requireAuthUser } from "./auth";
import type { Env } from "./env";
import { HttpError } from "./http";

const env: Env = {
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
  ACCOUNT_URL: "https://accounts.example.com",
  APP_ID: "app-id",
  APP_SESSION_HMAC_SECRET: "secret",
  SESSION_KID: "kid",
  AUTH_MODE: "local-header",
};

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
        env,
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
        env,
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
      requireAuthUser(new Request("http://localhost/posts"), env),
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
        env,
      ),
    ).rejects.toMatchObject({
      status: 403,
      message: "Local auth is only available on localhost",
    } satisfies Partial<HttpError>);
  });
});
