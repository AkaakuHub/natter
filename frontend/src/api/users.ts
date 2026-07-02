import { ApiClient } from "./client";
import { User } from "./types";

interface UpdateUserData {
  name?: string;
  image?: string | null;
}

export class UsersApi {
  static async getAllUsers(): Promise<User[]> {
    try {
      const users = await ApiClient.get<User[]>("/users");
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  static async getUserById(id: string): Promise<User> {
    return ApiClient.get<User>(`/users/${id}`);
  }

  static async syncCurrentUser(): Promise<User> {
    const response = await fetch("/api/auth/current-user", {
      cache: "no-store",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to sync current user: ${response.status}`);
    }
    return (await response.json()) as User;
  }

  static async getCurrentAuthenticatedUser(): Promise<User | null> {
    try {
      return await this.syncCurrentUser();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("404") ||
        errorMessage.includes("HTTP error! status: 404") ||
        errorMessage.includes("Failed to fetch")
      ) {
        return null;
      }
      if (!errorMessage.includes("サーバーに接続できません")) {
        console.error("Error fetching current authenticated user:", error);
      }
      throw error;
    }
  }

  static async updateUser(
    id: string,
    updateData: UpdateUserData,
  ): Promise<User> {
    return ApiClient.patch<User>(`/users/${id}`, updateData);
  }

  static async getRecommendedUsers(limit?: number): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (limit) {
        params.append("limit", limit.toString());
      }
      const users = await ApiClient.get<User[]>(
        `/users/recommended?${params.toString()}`,
      );
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error("Error fetching recommended users:", error);
      return [];
    }
  }
}
