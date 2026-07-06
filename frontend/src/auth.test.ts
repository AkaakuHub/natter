import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyLocalHeaderAuth,
  getAppSessionCookieHeader,
  getAuthSession,
  getLocalAuthSession,
  handleAuthRoute,
} from "./auth";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("local-header auth mode", () => {
  it("returns a local session without link-auth cookies", async () => {
    vi.stubEnv("AUTH_MODE", "local-header");
    const request = new Request("http://localhost:3000/");

    await expect(getAuthSession(request)).resolves.toEqual({
      user: {
        id: "local-dev-user",
        name: "Local Dev User",
      },
    });
    await expect(getLocalAuthSession(request)).resolves.toEqual({
      user: {
        id: "local-dev-user",
        name: "Local Dev User",
      },
    });
    expect(getAppSessionCookieHeader(request)).toBeNull();
  });

  it("adds the worker local auth headers to proxied API requests", () => {
    vi.stubEnv("AUTH_MODE", "local-header");
    const headers = new Headers();

    applyLocalHeaderAuth(headers);

    expect(headers.get("x-natter-dev-discord-id")).toBe("local-dev-user");
    expect(headers.get("x-natter-dev-name")).toBe("Local Dev User");
  });

  it("keeps auth routes local in local-header mode", async () => {
    vi.stubEnv("AUTH_MODE", "local-header");

    const response = await handleAuthRoute(
      new Request("http://localhost:3000/login"),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("http://localhost:3000/");
  });
});
