import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "./client";
import { NetworkError } from "./errors";

const fetchMock = vi.fn<typeof fetch>();

function mockResponse(body: string | null, init?: ResponseInit): Response {
  return new Response(body, init);
}

function latestFetchCall(): Parameters<typeof fetch> {
  const call = fetchMock.mock.calls.at(-1);
  if (!call) {
    throw new Error("fetch was not called");
  }
  return call;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ApiClient JSON requests", () => {
  it("sends JSON GET requests to the backend proxy with credentials included", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await expect(ApiClient.get<{ ok: boolean }>("/posts")).resolves.toEqual({
      ok: true,
    });

    expect(latestFetchCall()).toEqual([
      "/api/backend/posts",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    ]);
  });

  it("uses same-origin credentials when auth is skipped", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await ApiClient.get<{ ok: boolean }>("/public", true);

    expect(latestFetchCall()[1]).toMatchObject({
      credentials: "same-origin",
    });
  });

  it("serializes POST bodies as JSON", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(null, { status: 204 }));

    await expect(
      ApiClient.post("/posts", { content: "hello" }),
    ).resolves.toEqual({});

    expect(latestFetchCall()[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ content: "hello" }),
    });
  });

  it("rejects invalid JSON responses", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse("not json", { status: 200 }));

    await expect(ApiClient.get("/posts")).rejects.toThrow(
      "Invalid JSON response",
    );
  });

  it("maps network failures to NetworkError", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(ApiClient.get("/posts")).rejects.toBeInstanceOf(NetworkError);
    await expect(ApiClient.get("/posts")).rejects.toThrow(
      "サーバーに接続できません",
    );
  });

  it("throws fixed authentication and authorization errors", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse("no session", { status: 401 }),
    );
    await expect(ApiClient.get("/posts")).rejects.toThrow(
      "Authentication required",
    );

    fetchMock.mockResolvedValueOnce(mockResponse("forbidden", { status: 403 }));
    await expect(ApiClient.get("/posts")).rejects.toThrow("Access forbidden");
  });

  it("throws HTTP status errors for bad requests", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(JSON.stringify({ message: "content is required" }), {
        status: 400,
      }),
    );

    await expect(ApiClient.post("/posts", {})).rejects.toThrow(
      "HTTP error! status: 400",
    );
  });
});

describe("ApiClient FormData requests", () => {
  it("posts FormData without forcing a JSON content type", async () => {
    const formData = new FormData();
    formData.append("content", "hello");
    fetchMock.mockResolvedValueOnce(
      mockResponse(JSON.stringify({ id: 1 }), { status: 200 }),
    );

    await expect(
      ApiClient.postFormData<{ id: number }>("/posts", formData),
    ).resolves.toEqual({ id: 1 });

    expect(latestFetchCall()).toEqual([
      "/api/backend/posts",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    ]);
  });

  it("patches FormData through the backend proxy", async () => {
    const formData = new FormData();
    formData.append("content", "updated");
    fetchMock.mockResolvedValueOnce(
      mockResponse(JSON.stringify({ id: 1 }), { status: 200 }),
    );

    await expect(
      ApiClient.patchFormData<{ id: number }>("/posts/1", formData),
    ).resolves.toEqual({ id: 1 });

    expect(latestFetchCall()).toEqual([
      "/api/backend/posts/1",
      {
        method: "PATCH",
        body: formData,
        credentials: "include",
      },
    ]);
  });
});
