import { describe, expect, it } from "vitest";

import {
  hasEditablePostChanges,
  normalizeEditablePostSnapshot,
} from "./editPostChanges";

const original = normalizeEditablePostSnapshot({
  content: "hello",
  images: ["a.png"],
  imagesPublic: false,
  url: "https://example.com",
  characterId: 1,
});

describe("hasEditablePostChanges", () => {
  it("detects unchanged drafts", () => {
    expect(
      hasEditablePostChanges(original, {
        content: "hello",
        retainedImages: ["a.png"],
        addedImagesCount: 0,
        imagesPublic: false,
        url: "https://example.com",
        selectedCharacter: {
          id: 1,
          name: "Alice",
          userId: "user-1",
          createdAt: "2026-07-04T00:00:00.000Z",
          updatedAt: "2026-07-04T00:00:00.000Z",
          postsCount: 1,
        },
      }),
    ).toBe(false);
  });

  it("detects retained image removals and new image additions", () => {
    expect(
      hasEditablePostChanges(original, {
        content: "hello",
        retainedImages: [],
        addedImagesCount: 0,
        imagesPublic: false,
        url: "https://example.com",
        selectedCharacter: {
          id: 1,
          name: "Alice",
          userId: "user-1",
          createdAt: "2026-07-04T00:00:00.000Z",
          updatedAt: "2026-07-04T00:00:00.000Z",
          postsCount: 1,
        },
      }),
    ).toBe(true);
    expect(
      hasEditablePostChanges(original, {
        content: "hello",
        retainedImages: ["a.png"],
        addedImagesCount: 1,
        imagesPublic: false,
        url: "https://example.com",
        selectedCharacter: {
          id: 1,
          name: "Alice",
          userId: "user-1",
          createdAt: "2026-07-04T00:00:00.000Z",
          updatedAt: "2026-07-04T00:00:00.000Z",
          postsCount: 1,
        },
      }),
    ).toBe(true);
  });

  it("detects metadata changes", () => {
    expect(
      hasEditablePostChanges(original, {
        content: "hello",
        retainedImages: ["a.png"],
        addedImagesCount: 0,
        imagesPublic: true,
        url: "https://example.com",
        selectedCharacter: null,
      }),
    ).toBe(true);
  });
});
