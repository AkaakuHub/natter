import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
const fetchMock = vi.fn<typeof fetch>();

async function importImageUtils() {
  return import("./imageUtils");
}

beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", {
    location: { origin: "https://natter.example.com" },
  });
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:cached-image");
});

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getCachedImageWithAuth", () => {
  it("fetches API images through the backend proxy and caches the blob URL", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    fetchMock.mockResolvedValueOnce(
      new Response(new Blob(["image"], { type: "image/jpeg" }), {
        status: 200,
      }),
    );
    const { getCachedImageWithAuth } = await importImageUtils();

    await expect(
      getCachedImageWithAuth("https://api.example.com/posts/images/a.jpg"),
    ).resolves.toBe("blob:cached-image");
    await expect(
      getCachedImageWithAuth("https://api.example.com/posts/images/a.jpg"),
    ).resolves.toBe("blob:cached-image");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend/posts/images/a.jpg",
      {
        credentials: "include",
        method: "GET",
      },
    );
  });

  it("keeps non-API image URLs unchanged when fetching", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    fetchMock.mockResolvedValueOnce(
      new Response(new Blob(["image"], { type: "image/jpeg" }), {
        status: 200,
      }),
    );
    const { getCachedImageWithAuth } = await importImageUtils();

    await expect(
      getCachedImageWithAuth("https://cdn.example.com/a.jpg"),
    ).resolves.toBe("blob:cached-image");

    expect(fetchMock).toHaveBeenCalledWith("https://cdn.example.com/a.jpg", {
      credentials: "include",
      method: "GET",
    });
  });

  it("shares in-flight requests for the same image URL", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    fetchMock.mockResolvedValueOnce(
      new Response(new Blob(["image"], { type: "image/jpeg" }), {
        status: 200,
      }),
    );
    const { getCachedImageWithAuth } = await importImageUtils();
    const imageUrl = "https://api.example.com/posts/images/a.jpg";

    await expect(
      Promise.all([
        getCachedImageWithAuth(imageUrl),
        getCachedImageWithAuth(imageUrl),
      ]),
    ).resolves.toEqual(["blob:cached-image", "blob:cached-image"]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when image fetch fails", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    fetchMock.mockResolvedValueOnce(new Response("missing", { status: 404 }));
    const { getCachedImageWithAuth } = await importImageUtils();

    await expect(
      getCachedImageWithAuth("https://api.example.com/posts/images/missing.jpg"),
    ).rejects.toThrow("Failed to fetch image: 404");
  });
});
