import { ApiClient } from "./client";
import type {
  Character,
  CreateCharacterDto,
  UpdateCharacterDto,
} from "./types";

export const CharactersApi = {
  // ユーザーのキャラクター一覧を取得
  async getCharacters(): Promise<Character[]> {
    return ApiClient.get<Character[]>("/characters");
  },

  // 特定のユーザーのキャラクター一覧を取得
  async getCharactersByUserId(userId: string): Promise<Character[]> {
    return ApiClient.get<Character[]>(`/characters?userId=${userId}`);
  },

  // 特定のキャラクターを取得
  async getCharacter(id: number): Promise<Character> {
    return ApiClient.get<Character>(`/characters/${id}`);
  },

  // キャラクターを作成
  async createCharacter(data: CreateCharacterDto): Promise<Character> {
    return ApiClient.post<Character>("/characters", data);
  },

  // キャラクターを更新
  async updateCharacter(
    id: number,
    data: UpdateCharacterDto,
  ): Promise<Character> {
    return ApiClient.patch<Character>(`/characters/${id}`, data);
  },

  // キャラクターを削除
  async deleteCharacter(id: number): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>(`/characters/${id}`);
  },

  // 名前でキャラクターを検索（オートコンプリート用）
  async searchCharacters(query: string): Promise<Character[]> {
    return ApiClient.get<Character[]>(
      `/characters/search?query=${encodeURIComponent(query)}`,
    );
  },
};
