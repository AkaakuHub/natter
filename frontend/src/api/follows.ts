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
    const endpoint = userId
      ? `/follows/following?userId=${userId}`
      : "/follows/following";
    return ApiClient.get(endpoint);
  }

  static async getFollowers(userId?: string): Promise<FollowUser[]> {
    const endpoint = userId
      ? `/follows/followers?userId=${userId}`
      : "/follows/followers";
    return ApiClient.get(endpoint);
  }

  static async getFollowStatus(userId: string): Promise<FollowStatus> {
    return ApiClient.get(`/follows/status/${userId}`);
  }
}
