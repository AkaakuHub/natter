import { ApiClient } from "./client";

export interface AuthRequest {
  key: string;
  userId?: string;
}

export interface AuthResponse {
  status: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    twitterId: string;
    image: string | null;
  };
}

export const AuthApi = {
  async authenticate(request: AuthRequest): Promise<AuthResponse> {
    return ApiClient.post<AuthResponse>("/check-server", request);
  },

  async validateToken(): Promise<boolean> {
    try {
      // トークンが必要なエンドポイントを呼び出してトークンの有効性を確認
      await ApiClient.get("/posts");
      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  },
};