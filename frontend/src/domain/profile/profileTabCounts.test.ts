import { describe, expect, it } from "vitest";

import type { Character, Post } from "@/api";
import { profileTabCounts } from "./profileTabCounts";

const post = (id: number): Post => ({
  id,
  content: `post-${id}`,
  images: [],
  published: true,
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
});

const character = (id: number): Character => ({
  id,
  name: `character-${id}`,
  userId: "user-1",
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
  postsCount: 1,
});

describe("profileTabCounts", () => {
  it("counts each profile tab from the loaded collections", () => {
    expect(
      profileTabCounts({
        posts: [post(1), post(2)],
        mediaPosts: [post(3)],
        likedPosts: [post(4), post(5), post(6)],
        characters: [character(1), character(2)],
      }),
    ).toEqual({
      tweets: 2,
      media: 1,
      likes: 3,
      characters: 2,
    });
  });
});
