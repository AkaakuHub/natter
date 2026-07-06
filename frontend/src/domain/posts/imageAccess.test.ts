import { describe, expect, it } from "vitest";
import { shouldFetchPostImageWithAuth } from "./imageAccess";

describe("shouldFetchPostImageWithAuth", () => {
  it("fetches public images with auth to keep the existing image path", () => {
    expect(
      shouldFetchPostImageWithAuth(
        { authorId: "author", imagesPublic: true },
        "viewer",
      ),
    ).toBe(true);
  });

  it("fetches private own images with auth", () => {
    expect(
      shouldFetchPostImageWithAuth(
        { authorId: "author", imagesPublic: false },
        "author",
      ),
    ).toBe(true);
  });

  it("does not fetch private images owned by another user with auth", () => {
    expect(
      shouldFetchPostImageWithAuth(
        { authorId: "author", imagesPublic: false },
        "viewer",
      ),
    ).toBe(false);
  });

  it("keeps the previous authenticated path when visibility is unknown", () => {
    expect(shouldFetchPostImageWithAuth({ authorId: "author" }, "viewer")).toBe(
      true,
    );
  });
});
