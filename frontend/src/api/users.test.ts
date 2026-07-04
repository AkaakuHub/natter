import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "./client";
import type { User } from "./types";
import { UsersApi } from "./users";

vi.mock("./client", () => ({
  ApiClient: {
    get: vi.fn(),
  },
}));

const user: User = {
  id: "user-1",
  name: "Alice",
  image: null,
  tel: null,
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
};

const mockedApiClient = vi.mocked(ApiClient);

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mockedApiClient.get.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UsersApi", () => {
  it("returns user arrays from list endpoints", async () => {
    mockedApiClient.get.mockResolvedValueOnce([user]);

    await expect(UsersApi.getAllUsers()).resolves.toEqual([user]);
    expect(mockedApiClient.get).toHaveBeenCalledWith("/users");
  });

  it("returns an empty list when list endpoints return non-arrays or fail", async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({ id: "user-1" })
      .mockRejectedValueOnce(new Error("failure"));

    await expect(UsersApi.getAllUsers()).resolves.toEqual([]);
    await expect(UsersApi.getRecommendedUsers()).resolves.toEqual([]);
  });

  it("builds user detail and current user endpoints", async () => {
    mockedApiClient.get
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user);

    await UsersApi.getUserById("user-1");
    await UsersApi.syncCurrentUser();
    await UsersApi.getRecommendedUsers(5);

    expect(mockedApiClient.get).toHaveBeenNthCalledWith(1, "/users/user-1");
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(2, "/users/current");
    expect(mockedApiClient.get).toHaveBeenNthCalledWith(
      3,
      "/users/recommended?limit=5",
    );
  });

  it("returns null for missing or unreachable authenticated users", async () => {
    mockedApiClient.get
      .mockRejectedValueOnce(new Error("HTTP error! status: 404"))
      .mockRejectedValueOnce(new Error("Failed to fetch"));

    await expect(UsersApi.getCurrentAuthenticatedUser()).resolves.toBeNull();
    await expect(UsersApi.getCurrentAuthenticatedUser()).resolves.toBeNull();
  });

  it("rethrows current user errors that are not treated as missing users", async () => {
    const error = new Error("Access forbidden");
    mockedApiClient.get.mockRejectedValueOnce(error);

    await expect(UsersApi.getCurrentAuthenticatedUser()).rejects.toBe(error);
  });
});
