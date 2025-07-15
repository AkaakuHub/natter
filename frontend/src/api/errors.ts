// API エラータイプの定義

export class NetworkError extends Error {
  constructor(message = "ネットワーク接続エラーが発生しました") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ServerError extends Error {
  public status: number;

  constructor(status: number, message = "サーバーエラーが発生しました") {
    super(message);
    this.name = "ServerError";
    this.status = status;
  }
}

export class NotFoundError extends Error {
  constructor(message = "要求されたリソースが見つかりません") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class AuthenticationError extends Error {
  constructor(message = "認証が必要です") {
    super(message);
    this.name = "AuthenticationError";
  }
}

// エラータイプを判別するヘルパー関数
export const isNetworkError = (error: unknown): error is NetworkError => {
  return (
    error instanceof NetworkError ||
    (error instanceof Error &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("Network request failed") ||
        error.message.includes("fetch")))
  );
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return (
    error instanceof NotFoundError ||
    (error instanceof Error &&
      (error.message.includes("404") ||
        error.message.includes("HTTP error! status: 404")))
  );
};
