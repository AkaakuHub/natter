import { describe, expect, it } from "vitest";
import {
  getDirectImagePreviewUrls,
  isAuthenticatedPostImagePreview,
} from "./imagePreviewSource";

describe("isAuthenticatedPostImagePreview", () => {
  it("uses the authenticated image path for stored post images", () => {
    expect(
      isAuthenticatedPostImagePreview(
        "https://api.example.com/posts/images/private.jpg",
      ),
    ).toBe(true);
  });

  it("keeps local pasted image previews on the direct preview path", () => {
    expect(
      isAuthenticatedPostImagePreview("blob:https://natter.example.com/1"),
    ).toBe(false);
  });
});

describe("getDirectImagePreviewUrls", () => {
  it("excludes stored post images from direct preloading", () => {
    expect(
      getDirectImagePreviewUrls([
        "https://api.example.com/posts/images/private.jpg",
        "blob:https://natter.example.com/1",
      ]),
    ).toEqual(["blob:https://natter.example.com/1"]);
  });
});
