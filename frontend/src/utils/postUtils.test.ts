import { afterEach, describe, expect, it } from "vitest";

import { getImageUrl } from "./postUtils";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
});

describe("getImageUrl", () => {
  it("keeps absolute image URLs unchanged", () => {
    expect(getImageUrl("https://cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg",
    );
    expect(getImageUrl("http://cdn.example.com/a.jpg")).toBe(
      "http://cdn.example.com/a.jpg",
    );
  });

  it("builds backend image URLs for stored image names", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    expect(getImageUrl("images-1.jpg")).toBe(
      "https://api.example.com/posts/images/images-1.jpg",
    );
  });
});
