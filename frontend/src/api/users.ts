import { ApiClient } from "./client";
import { User } from "./types";

interface CreateUserData {
  userId: string;
  name: string;
  image?: string | null;
}

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

  static async createUser(userData: CreateUserData): Promise<User> {
    return ApiClient.post<User>(
      "/users",
      {
        discordId: userData.userId,
        name: userData.name,
        image: userData.image,
      },
      true,
    );
  }

  static async getUserByAuthId(userId: string): Promise<User | null> {
    try {
      return await ApiClient.get<User>(`/users/discord/${userId}`, true);
    } catch (error: unknown) {
      // 404エラー（ユーザーが存在しない）の場合はnullを返す
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("404") ||
        errorMessage.includes("HTTP error! status: 404") ||
        errorMessage.includes("Failed to fetch")
      ) {
        return null;
      }
      // NetworkErrorの場合はログを出力しない（サーバーダウン時の騒音を防ぐ）
      if (!errorMessage.includes("サーバーに接続できません")) {
        console.error("Error fetching user by auth ID:", error);
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
