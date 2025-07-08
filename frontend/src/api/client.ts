import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClient {
  private static baseURL = API_BASE_URL;

  private static async getAuthToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;

    try {
      const session = await getSession();
      console.log("🔍 ApiClient - Current session:", session);

      if (session?.user?.id) {
        // JWTトークンをローカルストレージから取得を試みる
        let jwtToken = localStorage.getItem("jwt_token");

        console.log(
          "🔍 ApiClient - JWT token from localStorage:",
          jwtToken ? `${jwtToken.substring(0, 50)}...` : "No token",
        );

        // デバッグ: 既存のトークンをログ出力
        if (jwtToken) {
          try {
            const parts = jwtToken.split(".");
            if (parts.length === 3) {
              const decodedPayload = this.safeBase64Decode(parts[1]);
              if (decodedPayload) {
                const payload = JSON.parse(decodedPayload);
                console.log("🔍 Existing token payload:", payload);
              } else {
                console.log("🔍 Failed to decode existing token payload");
              }
            }
          } catch (e) {
            console.log("🔍 Failed to parse existing token payload:", e);
          }
        }

        // JWTトークンがない場合、期限切れの場合、または必要なフィールドがない場合は新しいエンドポイントで取得
        const needNewToken =
          !jwtToken ||
          this.isTokenExpired(jwtToken) ||
          !this.hasRequiredFields(jwtToken);

        if (needNewToken) {
          console.log("🔍 ApiClient - Need new token, requesting from backend");
          // 古いトークンをクリア
          localStorage.removeItem("jwt_token");

          const authResponse = await this.requestJWTToken(session.user.id);

          if (authResponse?.token) {
            jwtToken = authResponse.token;
            localStorage.setItem("jwt_token", jwtToken);
            console.log("✅ ApiClient - New token obtained and stored");
          } else {
            console.error(
              "❌ Failed to obtain JWT token, response:",
              authResponse,
            );
            return null;
          }
        }

        return jwtToken;
      } else {
        console.warn("No session found - user may need to log in");
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

  private static safeBase64Decode(base64String: string): string | null {
    try {
      // JWT標準のBase64URLデコードを実装
      // Base64URLをBase64に変換
      let base64 = base64String.replace(/-/g, "+").replace(/_/g, "/");

      // パディングを追加
      const paddingNeeded = 4 - (base64.length % 4);
      if (paddingNeeded !== 4) {
        base64 += "=".repeat(paddingNeeded);
      }

      // まず通常のatobを試してみる
      let rawDecoded;
      try {
        rawDecoded = atob(base64);
      } catch (atobError) {
        console.error("❌ Standard atob failed:", atobError);
        // もしかしたらトークンがすでに破損している可能性
        console.log(
          "🔍 Raw token might be corrupted, clearing and forcing refresh",
        );
        localStorage.removeItem("jwt_token");
        return null;
      }

      // UTF-8デコード
      const decoded = decodeURIComponent(
        rawDecoded
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return decoded;
    } catch (error) {
      console.error("❌ Safe Base64 decode failed:", error);
      console.log("🔍 Clearing corrupted token and forcing refresh");
      localStorage.removeItem("jwt_token");
      return null;
    }
  }

  private static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        console.error("❌ Invalid JWT format - should have 3 parts");
        return true;
      }

      // UTF-8対応のBase64デコードを使用
      const decodedPayload = this.safeBase64Decode(parts[1]);
      if (!decodedPayload) {
        console.error("❌ Failed to decode JWT payload");
        localStorage.removeItem("jwt_token");
        return true;
      }

      const payload = JSON.parse(decodedPayload);
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp && payload.exp < currentTime;
      return isExpired;
    } catch (error) {
      console.error("❌ Error checking token expiration:", error);
      // 古いトークンをクリアして新しいトークンを取得させる
      localStorage.removeItem("jwt_token");
      return true; // エラーの場合は期限切れとみなす
    }
  }

  private static hasRequiredFields(token: string): boolean {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("❌ Invalid JWT format in hasRequiredFields");
        return false;
      }

      // UTF-8対応のBase64デコードを使用
      const decodedPayload = this.safeBase64Decode(parts[1]);
      if (!decodedPayload) {
        console.error("❌ Failed to decode JWT payload in hasRequiredFields");
        return false;
      }

      const payload = JSON.parse(decodedPayload);
      const hasRequired = payload.id && payload.name && payload.twitterId;
      return hasRequired;
    } catch (error) {
      console.error("❌ Error checking token structure:", error);
      return false;
    }
  }

  private static async requestJWTToken(
    userId: string,
  ): Promise<{ token?: string } | null> {
    try {
      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "❌ Failed to get JWT token:",
          response.status,
          errorText,
        );
        return null;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Error requesting JWT token:", error);
      return null;
    }
  }

  private static async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    console.log(`🔍 ApiClient - Making request to: ${url}`);
    console.log(
      `🔍 ApiClient - Token for request:`,
      token ? `${token.substring(0, 50)}...` : "No token",
    );

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    };

    console.log(`🔍 ApiClient - Request headers:`, config.headers);

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // 認証エラーの場合の適切なハンドリング
        if (response.status === 401) {
          const errorText = await response.text();
          console.warn("Authentication failed for API request:", errorText);

          // JWT signature エラーの場合は古いトークンをクリアして再試行
          if (
            errorText.includes("Invalid JWT token") ||
            errorText.includes("signature")
          ) {
            console.log("🔄 JWT signature error - clearing token and retrying");
            localStorage.removeItem("jwt_token");
            // 1回だけ再試行
            const headers = (config.headers as Record<string, string>) || {};
            if (!headers["X-Retry-Attempt"]) {
              const newToken = await this.getAuthToken();
              if (newToken) {
                const retryConfig: RequestInit = {
                  ...config,
                  headers: {
                    ...headers,
                    Authorization: `Bearer ${newToken}`,
                    "X-Retry-Attempt": "1",
                  },
                };
                const retryResponse = await fetch(url, retryConfig);
                if (retryResponse.ok) {
                  const text = await retryResponse.text();
                  return text ? JSON.parse(text) : ({} as T);
                }
              }
            }
          }

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
    const response = await this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
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
          // JWT signature エラーの場合は古いトークンをクリアして再試行
          if (
            errorText.includes("Invalid JWT token") ||
            errorText.includes("signature")
          ) {
            console.log(
              "🔄 JWT signature error in FormData - clearing token and retrying",
            );
            localStorage.removeItem("jwt_token");
            // 1回だけ再試行
            const headers = (config.headers as Record<string, string>) || {};
            if (!headers["X-Retry-Attempt"]) {
              const newToken = await this.getAuthToken();
              if (newToken) {
                const retryConfig: RequestInit = {
                  ...config,
                  headers: {
                    ...headers,
                    Authorization: `Bearer ${newToken}`,
                    "X-Retry-Attempt": "1",
                  },
                };
                const retryResponse = await fetch(url, retryConfig);
                if (retryResponse.ok) {
                  const text = await retryResponse.text();
                  return text ? JSON.parse(text) : ({} as T);
                }
              }
            }
          }

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
        const errorText = await response.text();
        console.error(
          `HTTP ${response.status} error for FormData PATCH:`,
          errorText,
        );

        if (response.status === 401) {
          // JWT signature エラーの場合は古いトークンをクリアして再試行
          if (
            errorText.includes("Invalid JWT token") ||
            errorText.includes("signature")
          ) {
            console.log(
              "🔄 JWT signature error in FormData PATCH - clearing token and retrying",
            );
            localStorage.removeItem("jwt_token");
            // 1回だけ再試行
            const headers = (config.headers as Record<string, string>) || {};
            if (!headers["X-Retry-Attempt"]) {
              const newToken = await this.getAuthToken();
              if (newToken) {
                const retryConfig: RequestInit = {
                  ...config,
                  headers: {
                    ...headers,
                    Authorization: `Bearer ${newToken}`,
                    "X-Retry-Attempt": "1",
                  },
                };
                const retryResponse = await fetch(url, retryConfig);
                if (retryResponse.ok) {
                  const text = await retryResponse.text();
                  return text ? JSON.parse(text) : ({} as T);
                }
              }
            }
          }

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
