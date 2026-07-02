import {
  booleanValue,
  numberValue,
  optionalNumberValue,
  optionalStringValue,
  Row,
  stringValue,
} from "./db";

export interface User {
  id: string;
  name: string;
  tel: string | null;
  image: string | null;
  discordId: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    likes: number;
    following?: number;
    followers?: number;
  };
}

export interface Character {
  id: number;
  name: string;
  userId: string;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export interface Like {
  id: number;
  userId: string;
  postId: number;
  createdAt: string;
  user?: User;
}

export interface Post {
  id: number;
  title: string | null;
  content: string | null;
  images: string[];
  imagesPublic: boolean;
  url: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  authorId: string | null;
  author?: User | null;
  likes?: Like[];
  characterId: number | null;
  character?: Character | null;
  replyToId: number | null;
  replyTo?: Post | null;
  _count?: {
    likes: number;
    replies: number;
  };
}

export interface Notification {
  id: number;
  type: string;
  message: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  actorId: string;
  postId: number | null;
  user?: User;
  actor?: Pick<User, "id" | "name" | "image">;
  post?: {
    id: number;
    content: string | null;
    author: Pick<User, "id" | "name"> | null;
  } | null;
}

export function parseUser(row: Row): User {
  return {
    id: stringValue(row, "id"),
    name: stringValue(row, "name"),
    tel: optionalStringValue(row, "tel"),
    image: optionalStringValue(row, "image"),
    discordId: stringValue(row, "discordId"),
    isAdmin: booleanValue(row, "isAdmin"),
    createdAt: dateValue(row, "createdAt"),
    updatedAt: dateValue(row, "updatedAt"),
  };
}

export function parseCharacter(row: Row): Character {
  return {
    id: numberValue(row, "id"),
    name: stringValue(row, "name"),
    userId: stringValue(row, "userId"),
    postsCount: numberValue(row, "postsCount"),
    createdAt: dateValue(row, "createdAt"),
    updatedAt: dateValue(row, "updatedAt"),
  };
}

export function parsePost(row: Row): Post {
  return {
    id: numberValue(row, "id"),
    title: optionalStringValue(row, "title"),
    content: optionalStringValue(row, "content"),
    images: parseImages(optionalStringValue(row, "images")),
    imagesPublic: booleanValue(row, "imagesPublic"),
    url: optionalStringValue(row, "url"),
    published: booleanValue(row, "published"),
    createdAt: dateValue(row, "createdAt"),
    updatedAt: dateValue(row, "updatedAt"),
    deletedAt: optionalDateValue(row, "deletedAt"),
    authorId: optionalStringValue(row, "authorId"),
    characterId: optionalNumberValue(row, "characterId"),
    replyToId: optionalNumberValue(row, "replyToId"),
  };
}

export function parseLike(row: Row): Like {
  return {
    id: numberValue(row, "id"),
    userId: stringValue(row, "userId"),
    postId: numberValue(row, "postId"),
    createdAt: dateValue(row, "createdAt"),
  };
}

export function parseNotification(row: Row): Notification {
  return {
    id: numberValue(row, "id"),
    type: stringValue(row, "type"),
    message: optionalStringValue(row, "message"),
    read: booleanValue(row, "read"),
    createdAt: dateValue(row, "createdAt"),
    updatedAt: dateValue(row, "updatedAt"),
    userId: stringValue(row, "userId"),
    actorId: stringValue(row, "actorId"),
    postId: optionalNumberValue(row, "postId"),
  };
}

export function parseCount(row: Row | undefined): number {
  if (!row) {
    return 0;
  }
  const value = row.count;
  if (typeof value !== "number") {
    throw new Error("count must be number");
  }
  return value;
}

function dateValue(row: Row, key: string): string {
  const value = row[key];
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }
  throw new Error(`${key} must be date`);
}

function optionalDateValue(row: Row, key: string): string | null {
  const value = row[key];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }
  throw new Error(`${key} must be date or null`);
}

export function parseImages(value: string | null): string[] {
  if (!value) {
    return [];
  }
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("images must be an array");
  }
  return parsed.map((item) => {
    if (typeof item !== "string") {
      throw new Error("image item must be a string");
    }
    return item;
  });
}

export function serializeImages(images: string[]): string | null {
  return images.length > 0 ? JSON.stringify(images) : null;
}
