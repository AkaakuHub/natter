import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "./client";
import { CharactersApi } from "./characters";
import { FollowsApi } from "./follows";
import { NotificationsApi } from "./notifications";
import type { Character } from "./types";

vi.mock("./client", () => ({
  ApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const character: Character = {
  id: 1,
  name: "Secret",
  userId: "user-1",
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
  postsCount: 0,
};

const mockedApiClient = vi.mocked(ApiClient);

beforeEach(() => {
  mockedApiClient.get.mockReset();
  mockedApiClient.post.mockReset();
  mockedApiClient.patch.mockReset();
  mockedApiClient.delete.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CharactersApi", () => {
  it("delegates character queries to the current endpoints", async () => {
    mockedApiClient.get
      .mockResolvedValueOnce([character])
      .mockResolvedValueOnce([character])
      .mockResolvedValueOnce(character)
      .mockResolvedValueOnce([character]);

    await CharactersApi.getCharacters();
    await CharactersApi.getCharactersByUserId("user-1");
    await CharactersApi.getCharacter(1);
    await CharactersApi.searchCharacters("a b");

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(1, "/characters");
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      2,
      "/characters?userId=user-1",
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(3, "/characters/1");
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      4,
      "/characters/search?query=a%20b",
    );
  });

  it("delegates character commands to the current endpoints", async () => {
    mockedApiClient.post.mockResolvedValueOnce(character);
    mockedApiClient.patch.mockResolvedValueOnce(character);
    mockedApiClient.delete.mockResolvedValueOnce({ message: "ok" });

    await CharactersApi.createCharacter({ name: "Secret" });
    await CharactersApi.updateCharacter(1, { name: "Updated" });
    await CharactersApi.deleteCharacter(1);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/characters", {
      name: "Secret",
    });
    expect(mockedApiClient.patch).toHaveBeenCalledWith("/characters/1", {
      name: "Updated",
    });
    expect(mockedApiClient.delete).toHaveBeenCalledWith("/characters/1");
  });
});

describe("FollowsApi", () => {
  it("delegates follow commands and queries to the current endpoints", async () => {
    mockedApiClient.post.mockResolvedValueOnce({ message: "followed" });
    mockedApiClient.delete.mockResolvedValueOnce({ message: "unfollowed" });
    mockedApiClient.get
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ isFollowing: true });

    await FollowsApi.followUser("user-1");
    await FollowsApi.unfollowUser("user-1");
    await FollowsApi.getFollowing("user-1");
    await FollowsApi.getFollowers();
    await FollowsApi.getFollowStatus("user-1");

    expect(mockedApiClient.post).toHaveBeenCalledWith("/follows/user-1", {});
    expect(mockedApiClient.delete).toHaveBeenCalledWith("/follows/user-1");
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      1,
      "/follows/following?userId=user-1",
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      2,
      "/follows/followers",
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      3,
      "/follows/status/user-1",
    );
  });
});

describe("NotificationsApi", () => {
  it("delegates notification queries and commands to the current endpoints", async () => {
    mockedApiClient.get
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ count: 2 });
    mockedApiClient.post.mockResolvedValueOnce({ id: 1 });
    mockedApiClient.patch
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(undefined);
    mockedApiClient.delete.mockResolvedValueOnce(undefined);

    await NotificationsApi.getNotifications();
    await NotificationsApi.getNotification(1);
    await NotificationsApi.createNotification({
      type: "like",
      userId: "user-1",
      actorId: "user-2",
    });
    await NotificationsApi.updateNotification(1, { read: true });
    await NotificationsApi.markAsRead(1);
    await NotificationsApi.markAllAsRead();
    await NotificationsApi.getUnreadCount();
    await NotificationsApi.deleteNotification(1);

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(1, "/notifications");
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(2, "/notifications/1");
    expect(mockedApiClient.post).toHaveBeenCalledWith("/notifications", {
      type: "like",
      userId: "user-1",
      actorId: "user-2",
    });
    expect(mockedApiClient.patch).toHaveBeenNthCalledWith(
      1,
      "/notifications/1",
      { read: true },
    );
    expect(mockedApiClient.patch).toHaveBeenNthCalledWith(
      2,
      "/notifications/1/read",
    );
    expect(mockedApiClient.patch).toHaveBeenNthCalledWith(
      3,
      "/notifications/mark-all-read",
    );
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      3,
      "/notifications/unread-count",
    );
    expect(mockedApiClient.delete).toHaveBeenCalledWith("/notifications/1");
  });
});
