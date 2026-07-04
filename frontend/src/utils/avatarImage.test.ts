import { describe, expect, it } from "vitest";

import { avatarImageUrl } from "./avatarImage";

describe("avatarImageUrl", () => {
  it("returns the default avatar image when image is empty", () => {
    expect(avatarImageUrl()).toBe("/no_avatar_image_128x128.png");
    expect(avatarImageUrl(null)).toBe("/no_avatar_image_128x128.png");
    expect(avatarImageUrl("")).toBe("/no_avatar_image_128x128.png");
  });

  it("keeps absolute URLs unchanged", () => {
    expect(avatarImageUrl("https://example.com/avatar.png")).toBe(
      "https://example.com/avatar.png",
    );
    expect(avatarImageUrl("http://example.com/avatar.png")).toBe(
      "http://example.com/avatar.png",
    );
  });

  it("normalizes relative image paths to root-relative paths", () => {
    expect(avatarImageUrl("avatars/user.png")).toBe("/avatars/user.png");
    expect(avatarImageUrl("/avatars/user.png")).toBe("/avatars/user.png");
  });
});
