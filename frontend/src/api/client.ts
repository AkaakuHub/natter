import { handleApiRequestError, parseApiResponse } from "./response";

const jsonRequestErrorOptions = {
  authenticationMessage: "Authentication failed for API request:",
  forbiddenMessage: "Access forbidden - insufficient permissions",
  requestFailurePrefix: "API request failed:",
};

const postFormDataErrorOptions = {
  authenticationMessage: "Authentication failed for FormData request",
  forbiddenMessage: "Access forbidden for FormData request",
  httpErrorPrefix: "HTTP error for FormData",
  requestFailurePrefix: "API request failed:",
};

const patchFormDataErrorOptions = {
  authenticationMessage: "Authentication failed for FormData request",
  forbiddenMessage: "Access forbidden for FormData request",
  httpErrorPrefix: "HTTP error for FormData PATCH",
  requestFailurePrefix: "API request failed:",
};

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
      return await parseApiResponse<T>(response, jsonRequestErrorOptions);
    } catch (error) {
      handleApiRequestError(
        error,
        jsonRequestErrorOptions.requestFailurePrefix,
      );
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
      return await parseApiResponse<T>(response, {
        ...postFormDataErrorOptions,
        httpErrorPrefix: `HTTP ${response.status} error for FormData`,
      });
    } catch (error) {
      handleApiRequestError(
        error,
        postFormDataErrorOptions.requestFailurePrefix,
      );
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
      return await parseApiResponse<T>(response, {
        ...patchFormDataErrorOptions,
        httpErrorPrefix: `HTTP ${response.status} error for FormData PATCH`,
      });
    } catch (error) {
      handleApiRequestError(
        error,
        patchFormDataErrorOptions.requestFailurePrefix,
      );
    }
  }
}
