import { describe, expect, it, vi } from "vitest";

import type { Env } from "./env";
import worker from "./index";

const env: Env = {
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
  REALTIME: {
    idFromName: vi.fn(() => "global-id" as DurableObjectId),
    get: vi.fn(() => ({
      fetch: vi.fn(async () => new Response("event-stream")),
    })),
  } as DurableObjectNamespace,
  ACCOUNT_URL: "https://accounts.example.com",
  APP_ID: "app-id",
  APP_SESSION_HMAC_SECRET: "secret",
  SESSION_KID: "kid",
  FRONTEND_URLS: "https://natter.example.com, https://preview.example.com",
  AUTH_MODE: "local-header",
};

function createAuthenticatedEnv(): Env {
  return {
    ...env,
    DB: {
      prepare: (sql: string) => ({
        bind: (...params: unknown[]) => ({
          first: async () => {
            const now = new Date().toISOString();
            if (
              sql.includes(`WHERE "discordId" = ?`) ||
              sql.includes(`WHERE "id" = ?`)
            ) {
              return {
                id: params[0],
                name: "Local Dev User",
                tel: null,
                image: null,
                discordId: params[0],
                isAdmin: true,
                createdAt: now,
                updatedAt: now,
              };
            }
            return null;
          },
          run: async () => ({} as D1Result),
        }),
      }),
    } as D1Database,
  };
}

describe("worker fetch", () => {
  it("responds to root GET without touching external bindings", async () => {
    const response = await worker.fetch(
      new Request("https://api.example.com/", {
        headers: { Origin: "https://natter.example.com" },
      }),
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://natter.example.com",
    );
    expect(await response.text()).toBe("Hello World!");
  });

  it("responds to preflight OPTIONS with no content", async () => {
    const response = await worker.fetch(
      new Request("https://api.example.com/posts", {
        method: "OPTIONS",
        headers: { Origin: "https://preview.example.com" },
      }),
      env,
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://preview.example.com",
    );
    expect(await response.text()).toBe("");
  });

  it("returns JSON 404 responses for unknown routes", async () => {
    const response = await worker.fetch(
      new Request("https://api.example.com/unknown"),
      env,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(await response.json()).toEqual({ message: "Not found" });
  });

  it("returns the fixed OGP image path without authentication", async () => {
    const response = await worker.fetch(
      new Request("https://api.example.com/posts/ogp"),
      env,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ imagePath: "/og-image.png" });
  });

  it("returns 401 for protected routes on localhost without a local user header", async () => {
    const response = await worker.fetch(
      new Request("http://localhost/posts"),
      env,
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: "Unauthorized" });
  });

  it("returns 403 when local-header auth is used outside localhost", async () => {
    const response = await worker.fetch(
      new Request("https://api.example.com/posts", {
        headers: { "x-natter-dev-discord-id": "user-1" },
      }),
      env,
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      message: "Local auth is only available on localhost",
    });
  });

  it("forwards authenticated event streams to the realtime hub", async () => {
    const authenticatedEnv = createAuthenticatedEnv();
    const response = await worker.fetch(
      new Request("http://localhost/events", {
        headers: { "x-natter-dev-discord-id": "user-1" },
      }),
      authenticatedEnv,
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("event-stream");
    expect(authenticatedEnv.REALTIME.idFromName).toHaveBeenCalledWith("global");
  });
});
