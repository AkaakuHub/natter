import { ApiClient } from './client';
import { User } from './types';

export class UsersApi {
  static async getAllUsers(): Promise<User[]> {
    return ApiClient.get<User[]>('/users');
  }

  static async getUserById(id: number): Promise<User> {
    return ApiClient.get<User>(`/users/${id}`);
  }
}