import { ApiClient } from "./client";

export interface FollowUser {
  id: string;
  name: string;
  image?: string;
  followedAt: string;
}

export interface FollowStatus {
  isFollowing: boolean;
  followedAt?: string;
}

export interface FollowCounts {
  followingCount: number;
  followersCount: number;
}

export class FollowsApi {
  static async followUser(userId: string): Promise<{ message: string }> {
    return ApiClient.post(`/follows/${userId}`, {});
  }

  static async unfollowUser(userId: string): Promise<{ message: string }> {
    return ApiClient.delete(`/follows/${userId}`);
  }

  static async getFollowing(userId?: string): Promise<FollowUser[]> {
    const params = userId ? { userId } : {};
    return ApiClient.get("/follows/following", { params });
  }

  static async getFollowers(userId?: string): Promise<FollowUser[]> {
    const params = userId ? { userId } : {};
    return ApiClient.get("/follows/followers", { params });
  }

  static async getFollowStatus(userId: string): Promise<FollowStatus> {
    return ApiClient.get(`/follows/status/${userId}`);
  }
}
