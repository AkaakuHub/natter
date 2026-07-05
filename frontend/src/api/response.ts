import { NetworkError } from "./errors";

type ErrorLogOptions = {
  forbiddenMessage: string;
  authenticationMessage: string;
  requestFailurePrefix: string;
  httpErrorPrefix?: string;
};

export async function parseApiResponse<T>(
  response: Response,
  options: ErrorLogOptions,
): Promise<T> {
  if (!response.ok) {
    await throwApiResponseError(response, options);
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (jsonError) {
    console.error("JSON parse error:", jsonError);
    throw new Error("Invalid JSON response");
  }
}

export function handleApiRequestError(error: unknown, prefix: string): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isNetworkError =
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("ERR_CONNECTION_REFUSED") ||
    errorMessage.includes("ECONNREFUSED") ||
    error instanceof TypeError;

  if (isNetworkError) {
    throw new NetworkError("サーバーに接続できません");
  }

  console.error(prefix, error);
  throw error;
}

async function throwApiResponseError(
  response: Response,
  options: ErrorLogOptions,
): Promise<never> {
  if (options.httpErrorPrefix) {
    const errorText = await response.text();
    console.error(`${options.httpErrorPrefix}:`, errorText);
    throwKnownStatusError(response, options, errorText);
  }

  if (response.status === 401) {
    const errorText = await response.text();
    console.warn(options.authenticationMessage, errorText);
    throw new Error("Authentication required");
  }
  if (response.status === 403) {
    console.warn(options.forbiddenMessage);
    throw new Error("Access forbidden");
  }
  if (response.status === 400) {
    await throwBadRequestError(response);
  }

  throw new Error(`HTTP error! status: ${response.status}`);
}

function throwKnownStatusError(
  response: Response,
  options: ErrorLogOptions,
  errorText: string,
): never {
  if (response.status === 401) {
    console.warn(options.authenticationMessage);
    throw new Error("Authentication required");
  }
  if (response.status === 403) {
    console.warn(options.forbiddenMessage);
    throw new Error("Access forbidden");
  }
  if (response.status === 400) {
    throwBadRequestErrorFromText(response.status, errorText);
  }

  throw new Error(`HTTP error! status: ${response.status}`);
}

async function throwBadRequestError(response: Response): Promise<never> {
  try {
    const errorText = await response.text();
    throwBadRequestErrorFromText(response.status, errorText);
  } catch {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

function throwBadRequestErrorFromText(
  status: number,
  errorText: string,
): never {
  try {
    const parsedError = parseErrorText(errorText);
    if (Array.isArray(parsedError.message)) {
      throw new Error(parsedError.message.join(", "));
    }
    if (parsedError.message) {
      throw new Error(parsedError.message);
    }
    throw new Error(`Validation error: ${errorText}`);
  } catch {
    throw new Error(`HTTP error! status: ${status}`);
  }
}

function parseErrorText(errorText: string): { message?: string | string[] } {
  try {
    const value = JSON.parse(errorText) as unknown;
    if (isErrorObject(value)) {
      return value;
    }
    return {};
  } catch {
    return { message: errorText };
  }
}

function isErrorObject(
  value: unknown,
): value is { message?: string | string[] } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const message = (value as { message?: unknown }).message;
  return (
    message === undefined ||
    typeof message === "string" ||
    (Array.isArray(message) &&
      message.every((item) => typeof item === "string"))
  );
}
