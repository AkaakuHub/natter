import { NetworkError } from "./errors";

export class ApiClient {
  private static baseURL = "/api/backend";

  private static async request<T>(
    endpoint: string,
    options?: RequestInit,
    skipAuth = false,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: skipAuth ? "same-origin" : "include",
      ...options,
    };
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          const errorText = await response.text();
          console.warn("Authentication failed for API request:", errorText);
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          console.warn("Access forbidden - insufficient permissions");
          throw new Error("Access forbidden");
        }

        // 400エラー（バリデーションエラー等）の詳細メッセージを取得
        if (response.status === 400) {
          try {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText };
            }

            // NestJSのValidationエラー形式を処理
            if (errorData.message && Array.isArray(errorData.message)) {
              throw new Error(errorData.message.join(", "));
            } else if (errorData.message) {
              throw new Error(errorData.message);
            } else {
              throw new Error(`Validation error: ${errorText}`);
            }
          } catch {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
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
      // ネットワークエラー（サーバーダウン等）の場合は NetworkError を投げる
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isNetworkError =
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("ERR_CONNECTION_REFUSED") ||
        errorMessage.includes("ECONNREFUSED") ||
        error instanceof TypeError;

      if (isNetworkError) {
        // ネットワークエラーの場合はコンソールエラーを出力せずにNetworkErrorを投げる
        throw new NetworkError("サーバーに接続できません");
      }

      // その他のエラーの場合のみコンソール出力
      console.error("API request failed:", error);
      throw error;
    }
  }

  static async get<T>(endpoint: string, skipAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, skipAuth);
  }

  static async post<T>(
    endpoint: string,
    data?: unknown,
    skipAuth: boolean = false,
  ): Promise<T> {
    const response = await this.request<T>(
      endpoint,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      skipAuth,
    );
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

    const config: RequestInit = {
      body: formData,
      credentials: "include",
      method: "POST",
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

        // 400エラー（バリデーションエラー等）の詳細メッセージを取得
        if (response.status === 400) {
          try {
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText };
            }

            // NestJSのValidationエラー形式を処理
            if (errorData.message && Array.isArray(errorData.message)) {
              throw new Error(errorData.message.join(", "));
            } else if (errorData.message) {
              throw new Error(errorData.message);
            } else {
              throw new Error(`Validation error: ${errorText}`);
            }
          } catch {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
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
      // ネットワークエラー（サーバーダウン等）の場合は NetworkError を投げる
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isNetworkError =
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("ERR_CONNECTION_REFUSED") ||
        errorMessage.includes("ECONNREFUSED") ||
        error instanceof TypeError;

      if (isNetworkError) {
        // ネットワークエラーの場合はコンソールエラーを出力せずにNetworkErrorを投げる
        throw new NetworkError("サーバーに接続できません");
      }

      // その他のエラーの場合のみコンソール出力
      console.error("API request failed:", error);
      throw error;
    }
  }

  static async patchFormData<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      body: formData,
      credentials: "include",
      method: "PATCH",
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
          console.warn("Authentication failed for FormData request");
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          console.warn("Access forbidden for FormData request");
          throw new Error("Access forbidden");
        }

        // 400エラー（バリデーションエラー等）の詳細メッセージを取得
        if (response.status === 400) {
          try {
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText };
            }

            // NestJSのValidationエラー形式を処理
            if (errorData.message && Array.isArray(errorData.message)) {
              throw new Error(errorData.message.join(", "));
            } else if (errorData.message) {
              throw new Error(errorData.message);
            } else {
              throw new Error(`Validation error: ${errorText}`);
            }
          } catch {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
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
      // ネットワークエラー（サーバーダウン等）の場合は NetworkError を投げる
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isNetworkError =
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("ERR_CONNECTION_REFUSED") ||
        errorMessage.includes("ECONNREFUSED") ||
        error instanceof TypeError;

      if (isNetworkError) {
        // ネットワークエラーの場合はコンソールエラーを出力せずにNetworkErrorを投げる
        throw new NetworkError("サーバーに接続できません");
      }

      // その他のエラーの場合のみコンソール出力
      console.error("API request failed:", error);
      throw error;
    }
  }
}
