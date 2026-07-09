import { HttpError } from "../http";

export interface PostInput {
  title?: string;
  content?: string;
  images: string[];
  imagesPublic: boolean;
  url?: string;
  authorId: string;
  replyToId?: number;
  characterId?: number;
}

export interface PostUpdateInput {
  title?: string;
  content?: string;
  images?: string[];
  imagesPublic?: boolean;
  url?: string | null;
  published?: boolean;
  characterId?: number | null;
}

export function isMultipart(request: Request): boolean {
  return request.headers.get("Content-Type")?.includes("multipart/form-data") === true;
}

export function formString(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" && value !== "" ? value : undefined;
}

export function formNullableString(
  formData: FormData,
  name: string,
): string | null | undefined {
  if (!formData.has(name)) {
    return undefined;
  }
  const value = formData.get(name);
  if (value === "") {
    return null;
  }
  return typeof value === "string" ? value : undefined;
}

export function formBoolean(
  formData: FormData,
  name: string,
): boolean | undefined {
  const value = formData.get(name);
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}

export function formInteger(
  formData: FormData,
  name: string,
): number | undefined {
  const value = formData.get(name);
  if (typeof value !== "string" || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function formNullableInteger(
  formData: FormData,
  name: string,
): number | null | undefined {
  if (!formData.has(name)) {
    return undefined;
  }
  const value = formData.get(name);
  if (value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export function getStringArray(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new HttpError(400, "images must be an array");
  }
  return value.map((item) => {
    if (typeof item !== "string") {
      throw new HttpError(400, "images must be an array of strings");
    }
    return item;
  });
}

export function getOptionalStringArray(value: unknown): string[] | undefined {
  return value === undefined ? undefined : getStringArray(value);
}

export function getNullableInteger(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return undefined;
  }
  return value;
}
