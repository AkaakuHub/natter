import { ApiClient } from "./client";
import { User } from "./types";

interface CreateUserData {
  twitterId: string;
  name: string;
  image?: string;
}

interface UpdateUserData {
  name?: string;
  image?: string;
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

  static async createUser(userData: CreateUserData): Promise<User> {
    return ApiClient.post<User>("/users", userData);
  }

  static async getUserByTwitterId(twitterId: string): Promise<User | null> {
    try {
      return await ApiClient.get<User>(`/users/twitter/${twitterId}`);
    } catch (error: unknown) {
      // 404エラー（ユーザーが存在しない）の場合はnullを返す
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("404") ||
        errorMessage.includes("HTTP error! status: 404")
      ) {
        return null;
      }
      console.error("Error fetching user by Twitter ID:", error);
      return null;
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
