import { describe, expect, it } from "vitest";

import type { Env } from "./env";
import worker from "./index";

const env: Env = {
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
  ACCOUNT_URL: "https://accounts.example.com",
  APP_ID: "app-id",
  APP_SESSION_HMAC_SECRET: "secret",
  SESSION_KID: "kid",
  FRONTEND_URLS: "https://natter.example.com, https://preview.example.com",
  AUTH_MODE: "local-header",
};

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
});
