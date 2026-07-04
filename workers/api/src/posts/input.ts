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
  url?: string;
  published?: boolean;
}

export function isMultipart(request: Request): boolean {
  return request.headers.get("Content-Type")?.includes("multipart/form-data") === true;
}

export function formString(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" && value !== "" ? value : undefined;
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
