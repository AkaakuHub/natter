import { ApiClient } from './client';
import { User } from './types';

interface CreateUserData {
  twitterId: string;
  name: string;
  email?: string;
  image?: string;
}

export class UsersApi {
  static async getAllUsers(): Promise<User[]> {
    return ApiClient.get<User[]>('/users');
  }

  static async getUserById(id: number): Promise<User> {
    return ApiClient.get<User>(`/users/${id}`);
  }

  static async createUser(userData: CreateUserData): Promise<User> {
    return ApiClient.post<User>('/users', userData);
  }

  static async getUserByTwitterId(twitterId: string): Promise<User | null> {
    try {
      return await ApiClient.get<User>(`/users/twitter/${twitterId}`);
    } catch (error: any) {
      // 404エラー（ユーザーが存在しない）の場合はnullを返す
      if (error.message?.includes('404') || error.message?.includes('HTTP error! status: 404')) {
        return null;
      }
      console.error('Error fetching user by Twitter ID:', error);
      return null;
    }
  }
}