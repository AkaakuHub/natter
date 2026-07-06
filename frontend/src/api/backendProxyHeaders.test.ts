import { afterEach, describe, expect, it, vi } from "vitest";

import { buildBackendProxyHeaders } from "./backendProxyHeaders";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildBackendProxyHeaders", () => {
  it("drops client supplied local auth headers before adding server local auth", () => {
    vi.stubEnv("AUTH_MODE", "local-header");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8787");
    const headers = buildBackendProxyHeaders(
      new Headers({
        authorization: "Bearer client-token",
        cookie: "client-cookie=true",
        "x-natter-dev-discord-id": "attacker",
        "x-natter-dev-image": "https://example.com/attacker.png",
        "x-natter-dev-name": "Attacker",
      }),
      null,
    );

    expect(headers.get("authorization")).toBeNull();
    expect(headers.get("cookie")).toBeNull();
    expect(headers.get("x-natter-dev-discord-id")).toBe("local-dev-user");
    expect(headers.get("x-natter-dev-name")).toBe("Local Dev User");
    expect(headers.get("x-natter-dev-image")).toBeNull();
  });

  it("keeps local auth headers absent for non-local API URLs", () => {
    vi.stubEnv("AUTH_MODE", "local-header");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.natter.akaaku.net");
    const headers = buildBackendProxyHeaders(
      new Headers({
        "x-natter-dev-discord-id": "attacker",
        "x-natter-dev-name": "Attacker",
      }),
      "app-session=value",
    );

    expect(headers.get("cookie")).toBe("app-session=value");
    expect(headers.has("x-natter-dev-discord-id")).toBe(false);
    expect(headers.has("x-natter-dev-name")).toBe(false);
  });
});
