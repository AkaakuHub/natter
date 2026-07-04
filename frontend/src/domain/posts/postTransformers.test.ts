import { describe, expect, it } from "vitest";

import type { Post } from "@/api";
import { transformPostToPostComponent } from "./postTransformers";

const createdAt = "2026-07-04T00:00:00.000Z";
const updatedAt = "2026-07-04T01:00:00.000Z";

describe("transformPostToPostComponent", () => {
  it("returns null when the post has no author", () => {
    const post: Post = {
      id: 1,
      content: "hello",
      images: [],
      published: true,
      createdAt,
      updatedAt,
    };

    expect(transformPostToPostComponent(post)).toBeNull();
  });

  it("transforms API posts into post component data", () => {
    const post: Post = {
      id: 1,
      content: "hello",
      images: ["image.jpg"],
      url: "https://example.com",
      published: true,
      createdAt,
      updatedAt,
      authorId: "user-1",
      author: {
        id: "user-1",
        name: "Alice",
        image: "avatars/alice.png",
        createdAt,
        updatedAt,
      },
      likes: [],
      _count: { likes: 2, replies: 1 },
      replyToId: 10,
      replyTo: {
        id: 10,
        content: "parent",
        images: [],
        published: true,
        createdAt,
        updatedAt,
        authorId: "user-2",
        author: {
          id: "user-2",
          name: "Bob",
          image: null,
          createdAt,
          updatedAt,
        },
      },
    };

    expect(transformPostToPostComponent(post)).toEqual({
      transformedUser: {
        id: "user-1",
        name: "Alice",
        image: "/avatars/alice.png",
      },
      transformedPost: {
        id: 1,
        userId: "user-1",
        authorId: "user-1",
        content: "hello",
        images: ["image.jpg"],
        url: "https://example.com",
        createdAt,
        updatedAt,
        published: true,
        likes: [],
        author: post.author,
        _count: { likes: 2, replies: 1 },
        replyTo: {
          id: 10,
          userId: "user-2",
          content: "parent",
          images: [],
          createdAt,
          updatedAt,
          published: true,
          likes: [],
          authorId: "user-2",
          _count: { likes: 0, replies: 0 },
          replyTo: undefined,
          author: {
            id: "user-2",
            name: "Bob",
            image: "/no_avatar_image_128x128.png",
            createdAt,
            updatedAt,
          },
        },
        replyToId: 10,
        character: undefined,
      },
    });
  });
});
