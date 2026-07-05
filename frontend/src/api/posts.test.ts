import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "./client";
import { PostsApi } from "./posts";
import type { Post } from "./types";

vi.mock("./client", () => ({
  ApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    postFormData: vi.fn(),
    patchFormData: vi.fn(),
  },
}));

const post: Post = {
  id: 1,
  content: "hello",
  images: [],
  published: true,
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
};

const mockedApiClient = vi.mocked(ApiClient);

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mockedApiClient.get.mockReset();
  mockedApiClient.post.mockReset();
  mockedApiClient.patch.mockReset();
  mockedApiClient.delete.mockReset();
  mockedApiClient.postFormData.mockReset();
  mockedApiClient.patchFormData.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PostsApi list queries", () => {
  it("returns post arrays from list endpoints", async () => {
    mockedApiClient.get.mockResolvedValueOnce([post]);

    await expect(PostsApi.getAllPosts()).resolves.toEqual([post]);
    expect(mockedApiClient.get).toHaveBeenCalledWith("/posts");
  });

  it("returns an empty list when list endpoints return non-arrays", async () => {
    mockedApiClient.get.mockResolvedValueOnce({ id: 1 });

    await expect(PostsApi.getAllPosts()).resolves.toEqual([]);
  });

  it("returns an empty list when recoverable list endpoints fail", async () => {
    mockedApiClient.get.mockRejectedValueOnce(new Error("failure"));

    await expect(PostsApi.getMediaPosts()).resolves.toEqual([]);
  });

  it("builds search query parameters in the current order", async () => {
    mockedApiClient.get.mockResolvedValueOnce([post]);

    await expect(PostsApi.searchPosts("hello world", "media")).resolves.toEqual(
      [post],
    );
    expect(mockedApiClient.get).toHaveBeenCalledWith(
      "/posts?search=hello+world&type=media",
    );
  });

  it("builds user, liked, replies, and trending endpoints", async () => {
    mockedApiClient.get
      .mockResolvedValueOnce([post])
      .mockResolvedValueOnce([post])
      .mockResolvedValueOnce([post])
      .mockResolvedValueOnce([post]);

    await PostsApi.getPostsByUser("user-1");
    await PostsApi.getLikedPosts("user-1");
    await PostsApi.getReplies(1);
    await PostsApi.getTrendingPosts(10);

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      "/posts?userId=user-1",
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      2,
      "/posts?type=liked&userId=user-1",
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(3, "/posts/1/replies");
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      4,
      "/posts/trending?limit=10",
    );
  });
});

describe("PostsApi commands", () => {
  it("passes create, update, delete, and like commands to ApiClient", async () => {
    mockedApiClient.post
      .mockResolvedValueOnce(post)
      .mockResolvedValueOnce({ liked: true });
    mockedApiClient.patch.mockResolvedValueOnce(post);
    mockedApiClient.delete.mockResolvedValueOnce(undefined);

    await expect(PostsApi.createPost({ content: "hello" })).resolves.toEqual(
      post,
    );
    await expect(
      PostsApi.updatePost(1, { content: "updated" }),
    ).resolves.toEqual(post);
    await expect(PostsApi.deletePost(1)).resolves.toBeUndefined();
    await expect(PostsApi.likePost(1)).resolves.toEqual({ liked: true });

    expect(mockedApiClient.post).toHaveBeenNthCalledWith(1, "/posts", {
      content: "hello",
    });
    expect(mockedApiClient.patch).toHaveBeenCalledWith("/posts/1", {
      content: "updated",
    });
    expect(mockedApiClient.delete).toHaveBeenCalledWith("/posts/1");
    expect(mockedApiClient.post).toHaveBeenNthCalledWith(
      2,
      "/posts/1/like",
      {},
    );
  });

  it("passes FormData creation and update through ApiClient", async () => {
    const formData = new FormData();
    mockedApiClient.postFormData.mockResolvedValueOnce(post);
    mockedApiClient.patchFormData.mockResolvedValueOnce(post);

    await PostsApi.createPostWithImages(formData);
    await PostsApi.updatePostWithImages(1, formData);

    expect(mockedApiClient.postFormData).toHaveBeenCalledWith(
      "/posts",
      formData,
    );
    expect(mockedApiClient.patchFormData).toHaveBeenCalledWith(
      "/posts/1",
      formData,
    );
  });

  it("rethrows getPostById errors", async () => {
    const error = new Error("failure");
    mockedApiClient.get.mockRejectedValueOnce(error);

    await expect(PostsApi.getPostById(1)).rejects.toBe(error);
  });
});
