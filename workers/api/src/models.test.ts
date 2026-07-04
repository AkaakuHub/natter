import { describe, expect, it } from "vitest";

import {
  parseCharacter,
  parseCount,
  parseImages,
  parseLike,
  parseNotification,
  parsePost,
  parseUser,
  serializeImages,
} from "./models";

const createdAt = "2026-07-04T00:00:00.000Z";
const updatedAt = "2026-07-04T01:00:00.000Z";

describe("model row parsers", () => {
  it("parses user rows and converts numeric booleans", () => {
    expect(
      parseUser({
        id: "user-1",
        name: "Alice",
        tel: null,
        image: "avatar.png",
        discordId: "discord-1",
        isAdmin: 1,
        createdAt,
        updatedAt,
      }),
    ).toEqual({
      id: "user-1",
      name: "Alice",
      tel: null,
      image: "avatar.png",
      discordId: "discord-1",
      isAdmin: true,
      createdAt,
      updatedAt,
    });
  });

  it("parses character rows", () => {
    expect(
      parseCharacter({
        id: 1,
        name: "Secret",
        userId: "user-1",
        postsCount: 12,
        createdAt,
        updatedAt,
      }),
    ).toEqual({
      id: 1,
      name: "Secret",
      userId: "user-1",
      postsCount: 12,
      createdAt,
      updatedAt,
    });
  });

  it("parses post rows with JSON images and nullable relations", () => {
    expect(
      parsePost({
        id: 10,
        title: null,
        content: "hello",
        images: JSON.stringify(["a.jpg", "b.jpg"]),
        imagesPublic: 0,
        url: null,
        published: true,
        createdAt,
        updatedAt,
        deletedAt: null,
        authorId: "user-1",
        characterId: null,
        replyToId: 5,
      }),
    ).toEqual({
      id: 10,
      title: null,
      content: "hello",
      images: ["a.jpg", "b.jpg"],
      imagesPublic: false,
      url: null,
      published: true,
      createdAt,
      updatedAt,
      deletedAt: null,
      authorId: "user-1",
      characterId: null,
      replyToId: 5,
    });
  });

  it("converts numeric dates to ISO strings", () => {
    expect(
      parseLike({
        id: 1,
        userId: "user-1",
        postId: 2,
        createdAt: 1_788_480_000_000,
      }),
    ).toEqual({
      id: 1,
      userId: "user-1",
      postId: 2,
      createdAt: "2026-09-04T00:00:00.000Z",
    });
  });

  it("parses notification rows", () => {
    expect(
      parseNotification({
        id: 1,
        type: "like",
        message: null,
        read: 0,
        createdAt,
        updatedAt,
        userId: "user-1",
        actorId: "user-2",
        postId: null,
      }),
    ).toEqual({
      id: 1,
      type: "like",
      message: null,
      read: false,
      createdAt,
      updatedAt,
      userId: "user-1",
      actorId: "user-2",
      postId: null,
    });
  });

  it("throws when required row values have the wrong type", () => {
    expect(() =>
      parseUser({
        id: 1,
        name: "Alice",
        tel: null,
        image: null,
        discordId: "discord-1",
        isAdmin: false,
        createdAt,
        updatedAt,
      }),
    ).toThrow("id must be string");
  });
});

describe("image serialization", () => {
  it("parses null and empty image JSON as an empty list", () => {
    expect(parseImages(null)).toEqual([]);
    expect(parseImages("")).toEqual([]);
  });

  it("rejects non-array image JSON and non-string image items", () => {
    expect(() => parseImages(JSON.stringify({ image: "a.jpg" }))).toThrow(
      "images must be an array",
    );
    expect(() => parseImages(JSON.stringify(["a.jpg", 1]))).toThrow(
      "image item must be a string",
    );
  });

  it("serializes empty image lists as null", () => {
    expect(serializeImages([])).toBeNull();
    expect(serializeImages(["a.jpg"])).toBe(JSON.stringify(["a.jpg"]));
  });
});

describe("parseCount", () => {
  it("returns zero when the count row is missing", () => {
    expect(parseCount(undefined)).toBe(0);
  });

  it("returns numeric counts and rejects invalid count values", () => {
    expect(parseCount({ count: 3 })).toBe(3);
    expect(() => parseCount({ count: "3" })).toThrow("count must be number");
  });
});
