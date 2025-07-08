import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClient {
  private static baseURL = API_BASE_URL;

  private static async getAuthToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;

    try {
      const session = await getSession();
      if (session?.user?.id) {
        // セッションが存在する場合は、そのまま Twitter ID を返す
        console.log("Session found, returning user ID:", session.user.id);
        return session.user.id;
      } else {
        console.warn("No session found - user may need to log in");
        // ログイン済みなのにセッションがない場合の警告
        if (window.location.pathname !== "/login") {
          console.warn(
            "Warning: User appears to be logged in but no valid session found",
          );
        }
      }
    } catch (error) {
      console.error("Failed to get auth token:", error);
    }
    return null;
  }

  private static async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // 認証エラーの場合の適切なハンドリング
        if (response.status === 401) {
          console.warn("Authentication failed for API request");
          // 認証が必要なエンドポイントでは、ユーザーに適切なメッセージを表示
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          console.warn("Access forbidden - insufficient permissions");
          throw new Error("Access forbidden");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // レスポンスが空の場合の処理
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    console.log("🌐 ApiClient.post called:", { endpoint, data });
    const response = await this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    console.log("🌐 ApiClient.post response:", response);
    return response;
  }

  static async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // FormData用のメソッド（画像アップロード等）
  static async postFormData<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    // デバッグ用: FormDataの内容をログ
    console.log("📋 FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    const config: RequestInit = {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // FormDataの場合、Content-Typeは自動で設定される
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status} error for FormData:`, errorText);
        if (response.status === 401) {
          console.warn("Authentication failed for FormData request");
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          console.warn("Access forbidden for FormData request");
          throw new Error("Access forbidden");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  static async patchFormData<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const config: RequestInit = {
      method: "PATCH",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          console.warn("Authentication failed for FormData request");
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          console.warn("Access forbidden for FormData request");
          throw new Error("Access forbidden");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
}
