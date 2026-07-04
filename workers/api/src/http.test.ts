import { describe, expect, it } from "vitest";

import type { Env } from "./env";
import {
  corsHeaders,
  errorResponse,
  getBoolean,
  getInteger,
  HttpError,
  jsonResponse,
  parseId,
  parseLimit,
  readJsonObject,
  requireString,
} from "./http";

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

describe("corsHeaders", () => {
  it("uses the request origin when it is allowed", () => {
    const request = new Request("https://api.example.com/posts", {
      headers: { Origin: "https://preview.example.com" },
    });

    expect(corsHeaders(env, request)).toMatchObject({
      "Access-Control-Allow-Origin": "https://preview.example.com",
      "Access-Control-Allow-Credentials": "true",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
  });

  it("falls back to the first configured origin when request origin is not allowed", () => {
    const request = new Request("https://api.example.com/posts", {
      headers: { Origin: "https://evil.example.com" },
    });

    expect(corsHeaders(env, request)).toMatchObject({
      "Access-Control-Allow-Origin": "https://natter.example.com",
    });
  });
});

describe("jsonResponse", () => {
  it("serializes JSON and attaches CORS headers", async () => {
    const request = new Request("https://api.example.com/posts", {
      headers: { Origin: "https://natter.example.com" },
    });
    const response = jsonResponse(env, request, { ok: true }, 201);

    expect(response.status).toBe(201);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://natter.example.com",
    );
    expect(await response.json()).toEqual({ ok: true });
  });
});

describe("errorResponse", () => {
  it("keeps HttpError status and message", async () => {
    const request = new Request("https://api.example.com/posts");
    const response = errorResponse(env, request, new HttpError(403, "No"));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ message: "No" });
  });

  it("maps unknown errors to Internal error", async () => {
    const request = new Request("https://api.example.com/posts");
    const response = errorResponse(env, request, "failure");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: "Internal error" });
  });
});

describe("request value parsers", () => {
  it("parses boolean and integer query values", () => {
    expect(getBoolean(true)).toBe(true);
    expect(getBoolean("false")).toBe(false);
    expect(getBoolean("yes")).toBeUndefined();
    expect(getInteger(12)).toBe(12);
    expect(getInteger("12")).toBe(12);
    expect(getInteger("12.5")).toBeUndefined();
  });

  it("rejects invalid required strings, limits, and ids with HttpError", () => {
    expect(() => requireString("", "name")).toThrow(HttpError);
    expect(() => parseLimit("0", 5)).toThrow(HttpError);
    expect(() => parseLimit("101", 5)).toThrow(HttpError);
    expect(() => parseId("abc")).toThrow(HttpError);
  });

  it("uses default limit when the value is missing", () => {
    expect(parseLimit(null, 5)).toBe(5);
  });
});

describe("readJsonObject", () => {
  it("returns object JSON request bodies", async () => {
    const request = new Request("https://api.example.com/posts", {
      method: "POST",
      body: JSON.stringify({ content: "hello" }),
      headers: { "Content-Type": "application/json" },
    });

    await expect(readJsonObject(request)).resolves.toEqual({
      content: "hello",
    });
  });

  it("rejects array JSON request bodies", async () => {
    const request = new Request("https://api.example.com/posts", {
      method: "POST",
      body: JSON.stringify([]),
      headers: { "Content-Type": "application/json" },
    });

    await expect(readJsonObject(request)).rejects.toThrow(HttpError);
  });
});
