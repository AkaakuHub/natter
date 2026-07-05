import { allRows, firstRow, requireRow, run } from "./db";
import type { Env } from "./env";
import {
  corsHeaders,
  emptyResponse,
  errorResponse,
  getBoolean,
  getInteger,
  getString,
  HttpError,
  jsonResponse,
  parseId,
  parseLimit,
  readJsonObject,
  requireString,
} from "./http";
import { requireAuthUser } from "./auth";
import {
  Character,
  Like,
  Notification,
  parseCharacter,
  parseLike,
  parseNotification,
  parsePost,
  parseUser,
  parseCount,
  Post,
  serializeImages,
  User,
} from "./models";
import {
  hideCharacterNameIfNeeded,
  hideUrlIfNeeded,
  shouldRevealSecrets,
} from "./security";
import { sanitizeContent, sanitizeContentPreservingUrls } from "./sanitize";
import {
  createMosaicImageResponse,
  mosaicImageFilename,
} from "./images/mosaic";
import { contentTypeForImageFilename } from "./images/contentType";
import {
  formBoolean,
  formInteger,
  formString,
  getStringArray,
  isMultipart,
  type PostInput,
  type PostUpdateInput,
} from "./posts/input";
import { savePostImages } from "./posts/images";
export { RealtimeHub } from "./realtime";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return emptyResponse(env, request, 204);
    }

    try {
      return await route(request, env);
    } catch (error) {
      return errorResponse(env, request, error);
    }
  },
};

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method;
  const parts = path.split("/").filter(Boolean);

  if (method === "GET" && path === "/") {
    return new Response("Hello World!", {
      headers: corsHeaders(env, request),
    });
  }

  if (method === "HEAD" && path === "/users") {
    return emptyResponse(env, request, 200);
  }

  if (method === "GET" && path === "/events") {
    await requireAuthUser(request, env);
    return realtimeHub(env).fetch(new Request("https://realtime/events"));
  }

  if (parts[0] === "users") {
    return handleUsers(request, env, parts);
  }
  if (parts[0] === "posts") {
    return handlePosts(request, env, parts);
  }
  if (parts[0] === "follows") {
    return handleFollows(request, env, parts);
  }
  if (parts[0] === "characters") {
    return handleCharacters(request, env, parts);
  }
  if (parts[0] === "notifications") {
    return handleNotifications(request, env, parts);
  }
  if (parts[0] === "admin") {
    return handleAdmin(request, env, parts);
  }
  if (parts[0] === "metadata") {
    return handleMetadata(request, env);
  }

  throw new HttpError(404, "Not found");
}

async function handleUsers(
  request: Request,
  env: Env,
  parts: string[],
): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);

  if (method === "GET" && parts.length === 1) {
    await requireAuthUser(request, env);
    const users = (await allRows(env.DB, `SELECT * FROM "User" ORDER BY "createdAt" DESC`)).map(parseUser);
    return jsonResponse(env, request, users);
  }

  if (method === "GET" && parts[1] === "current") {
    const authUser = await requireAuthUser(request, env);
    return jsonResponse(env, request, requireRow(await getUserRowById(env.DB, authUser.id), parseUser, "User not found"));
  }

  if (method === "GET" && parts[1] === "recommended") {
    const authUser = await requireAuthUser(request, env);
    const limit = parseLimit(url.searchParams.get("limit"), 5);
    const users = await getRecommendedUsers(env.DB, limit, authUser.id);
    return jsonResponse(env, request, users);
  }

  if (parts[1]) {
    const userId = decodeURIComponent(parts[1]);
    if (method === "GET") {
      const user = await findUserWithCounts(env.DB, userId);
      if (!user) {
        throw new HttpError(404, "User not found");
      }
      return jsonResponse(env, request, user);
    }
  }

  throw new HttpError(404, "Not found");
}

async function handlePosts(
  request: Request,
  env: Env,
  parts: string[],
): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);

  if (method === "GET" && parts[1] === "images" && parts[2]) {
    return handleImage(request, env, decodeURIComponent(parts[2]));
  }

  if (method === "GET" && parts[1] === "ogp") {
    return jsonResponse(env, request, { imagePath: "/og-image.png" });
  }

  if (method === "GET" && parts[1] === "trending") {
    const authUser = await requireAuthUser(request, env);
    const limit = parseLimit(url.searchParams.get("limit"), 5);
    const rows = await allRows(
      env.DB,
      `SELECT p.*
       FROM "Post" p
       LEFT JOIN "Like" l ON l."postId" = p."id"
       WHERE p."deletedAt" IS NULL
       GROUP BY p."id"
       ORDER BY COUNT(l."id") DESC, p."createdAt" DESC
       LIMIT ?`,
      limit,
    );
    return jsonResponse(env, request, await enrichPosts(env.DB, rows.map(parsePost), authUser.id));
  }

  if (method === "GET" && parts.length === 1) {
    const authUser = await requireAuthUser(request, env);
    const type = url.searchParams.get("type");
    const userId = url.searchParams.get("userId");
    const search = url.searchParams.get("search");
    const posts = await findPosts(env.DB, { type, userId, search });
    const enrichedPosts = await enrichPosts(env.DB, posts, authUser.id);
    return jsonResponse(env, request, type === "media" ? enrichedPosts.filter((post) => post.images.length > 0) : enrichedPosts);
  }

  if (method === "POST" && parts.length === 1) {
    const authUser = await requireAuthUser(request, env);
    const input = await readPostInput(request, env, authUser.id);
    const post = await createPost(env.DB, input);
    await broadcastPostCreated(env, post.id, authUser.id);
    return jsonResponse(env, request, await getPostResponse(env.DB, post.id, authUser.id));
  }

  if (parts[1]) {
    const postId = parseId(parts[1]);

    if (method === "GET" && parts.length === 2) {
      const authUser = await requireAuthUser(request, env);
      return jsonResponse(env, request, await getPostResponse(env.DB, postId, authUser.id));
    }

    if (method === "PATCH" && parts.length === 2) {
      const authUser = await requireAuthUser(request, env);
      const existing = await getPost(env.DB, postId);
      if (!existing) {
        throw new HttpError(400, "Post not found");
      }
      if (existing.authorId !== authUser.id) {
        throw new HttpError(403, "You can only edit your own posts");
      }
      const input = await readPostUpdateInput(request, env, authUser.id);
      await updatePost(env.DB, postId, input);
      return jsonResponse(env, request, await getPostResponse(env.DB, postId, authUser.id));
    }

    if (method === "DELETE" && parts.length === 2) {
      const authUser = await requireAuthUser(request, env);
      const existing = await getPost(env.DB, postId);
      if (!existing) {
        throw new HttpError(400, "Post not found");
      }
      if (existing.authorId !== authUser.id) {
        throw new HttpError(403, "You can only delete your own posts");
      }
      await softDeletePost(env.DB, existing);
      return emptyResponse(env, request, 204);
    }

    if (method === "POST" && parts[2] === "like") {
      const authUser = await requireAuthUser(request, env);
      return jsonResponse(env, request, await toggleLike(env.DB, postId, authUser.id));
    }

    if (method === "GET" && parts[2] === "likes") {
      return jsonResponse(env, request, await getPostLikes(env.DB, postId));
    }

    if (method === "GET" && parts[2] === "replies") {
      const authUser = await requireAuthUser(request, env);
      const rows = await allRows(
        env.DB,
        `SELECT * FROM "Post" WHERE "replyToId" = ? AND "deletedAt" IS NULL ORDER BY "createdAt" ASC`,
        postId,
      );
      return jsonResponse(env, request, await enrichPosts(env.DB, rows.map(parsePost), authUser.id));
    }
  }

  throw new HttpError(404, "Not found");
}

async function handleFollows(
  request: Request,
  env: Env,
  parts: string[],
): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);

  if (method === "POST" && parts[1]) {
    const authUser = await requireAuthUser(request, env);
    const followingId = decodeURIComponent(parts[1]);
    if (authUser.id === followingId) {
      throw new HttpError(400, "Cannot follow yourself");
    }
    if (!(await findUserById(env.DB, followingId))) {
      throw new HttpError(400, "User not found");
    }
    if (await getFollow(env.DB, authUser.id, followingId)) {
      throw new HttpError(400, "Already following this user");
    }
    await run(
      env.DB,
      `INSERT INTO "Follow" ("followerId", "followingId", "createdAt") VALUES (?, ?, ?)`,
      authUser.id,
      followingId,
      new Date().toISOString(),
    );
    await createFollowNotification(env.DB, followingId, authUser.id);
    return jsonResponse(env, request, { message: "Successfully followed user" });
  }

  if (method === "DELETE" && parts[1]) {
    const authUser = await requireAuthUser(request, env);
    const followingId = decodeURIComponent(parts[1]);
    if (!(await getFollow(env.DB, authUser.id, followingId))) {
      throw new HttpError(400, "Not following this user");
    }
    await run(
      env.DB,
      `DELETE FROM "Follow" WHERE "followerId" = ? AND "followingId" = ?`,
      authUser.id,
      followingId,
    );
    await run(
      env.DB,
      `DELETE FROM "Notification" WHERE "type" = 'follow' AND "userId" = ? AND "actorId" = ?`,
      followingId,
      authUser.id,
    );
    return jsonResponse(env, request, { message: "Successfully unfollowed user" });
  }

  if (method === "GET" && parts[1] === "following") {
    const authUser = await requireAuthUser(request, env);
    const targetUserId = url.searchParams.get("userId") ?? authUser.id;
    if (!targetUserId) {
      throw new HttpError(400, "User ID required");
    }
    const rows = await allRows(
      env.DB,
      `SELECT u.*, f."createdAt" AS "followedAt"
       FROM "Follow" f
       JOIN "User" u ON u."id" = f."followingId"
       WHERE f."followerId" = ?
       ORDER BY f."createdAt" DESC`,
      targetUserId,
    );
    return jsonResponse(env, request, rows.map((row) => ({ ...parseUser(row), followedAt: row.followedAt })));
  }

  if (method === "GET" && parts[1] === "followers") {
    const authUser = await requireAuthUser(request, env);
    const targetUserId = url.searchParams.get("userId") ?? authUser.id;
    if (!targetUserId) {
      throw new HttpError(400, "User ID required");
    }
    const rows = await allRows(
      env.DB,
      `SELECT u.*, f."createdAt" AS "followedAt"
       FROM "Follow" f
       JOIN "User" u ON u."id" = f."followerId"
       WHERE f."followingId" = ?
       ORDER BY f."createdAt" DESC`,
      targetUserId,
    );
    return jsonResponse(env, request, rows.map((row) => ({ ...parseUser(row), followedAt: row.followedAt })));
  }

  if (method === "GET" && parts[1] === "status" && parts[2]) {
    const authUser = await requireAuthUser(request, env);
    const follow = await getFollow(env.DB, authUser.id, decodeURIComponent(parts[2]));
    return jsonResponse(env, request, {
      isFollowing: Boolean(follow),
      followedAt: follow?.createdAt,
    });
  }

  throw new HttpError(404, "Not found");
}

async function handleCharacters(
  request: Request,
  env: Env,
  parts: string[],
): Promise<Response> {
  const method = request.method;
  const url = new URL(request.url);

  if (method === "GET" && parts.length === 1) {
    const authUser = await requireAuthUser(request, env);
    const userId = url.searchParams.get("userId") ?? authUser.id;
    if (!userId) {
      return jsonResponse(env, request, []);
    }
    const characters = await getCharactersByUser(env.DB, userId, authUser.id);
    return jsonResponse(env, request, characters);
  }

  if (method === "GET" && parts[1] === "search") {
    const authUser = await requireAuthUser(request, env);
    const query = url.searchParams.get("query");
    if (!query) {
      return jsonResponse(env, request, []);
    }
    const rows = await allRows(
      env.DB,
      `SELECT c.*, COUNT(p."id") AS "posts"
       FROM "Character" c
       LEFT JOIN "Post" p ON p."characterId" = c."id"
       WHERE c."userId" = ? AND c."name" LIKE ?
       GROUP BY c."id"
       ORDER BY c."createdAt" DESC
       LIMIT 10`,
      authUser.id,
      `%${query}%`,
    );
    return jsonResponse(env, request, rows.map(characterWithCount));
  }

  if (method === "POST" && parts.length === 1) {
    const authUser = await requireAuthUser(request, env);
    const body = await readJsonObject(request);
    const name = requireString(body.name, "name");
    const now = new Date().toISOString();
    await run(
      env.DB,
      `INSERT INTO "Character" ("name", "userId", "postsCount", "createdAt", "updatedAt") VALUES (?, ?, 0, ?, ?)`,
      name,
      authUser.id,
      now,
      now,
    );
    const character = await firstRow(
      env.DB,
      `SELECT * FROM "Character" WHERE "userId" = ? AND "name" = ?`,
      authUser.id,
      name,
    );
    return jsonResponse(env, request, requireRow(character, parseCharacter, "Character not found"));
  }

  if (parts[1]) {
    const id = parseId(parts[1]);
    if (method === "GET") {
      const authUser = await requireAuthUser(request, env);
      const character = await getOwnedCharacter(env.DB, id, authUser.id);
      if (!character) {
        throw new HttpError(404, "Character not found");
      }
      return jsonResponse(env, request, character);
    }
    if (method === "PATCH") {
      const authUser = await requireAuthUser(request, env);
      if (!(await getOwnedCharacter(env.DB, id, authUser.id))) {
        throw new HttpError(404, "Character not found");
      }
      const body = await readJsonObject(request);
      const name = requireString(body.name, "name");
      await run(
        env.DB,
        `UPDATE "Character" SET "name" = ?, "updatedAt" = ? WHERE "id" = ? AND "userId" = ?`,
        name,
        new Date().toISOString(),
        id,
        authUser.id,
      );
      return jsonResponse(env, request, await getOwnedCharacter(env.DB, id, authUser.id));
    }
    if (method === "DELETE") {
      const authUser = await requireAuthUser(request, env);
      if (!(await getOwnedCharacter(env.DB, id, authUser.id))) {
        throw new HttpError(404, "Character not found");
      }
      await run(env.DB, `UPDATE "Post" SET "characterId" = NULL WHERE "characterId" = ?`, id);
      await run(env.DB, `DELETE FROM "Character" WHERE "id" = ? AND "userId" = ?`, id, authUser.id);
      return jsonResponse(env, request, { message: "Character deleted successfully" });
    }
  }

  throw new HttpError(404, "Not found");
}

async function handleNotifications(
  request: Request,
  env: Env,
  parts: string[],
): Promise<Response> {
  const method = request.method;
  const authUser = await requireAuthUser(request, env);

  if (method === "GET" && parts.length === 1) {
    return jsonResponse(env, request, await getNotifications(env.DB, authUser.id));
  }

  if (method === "POST" && parts.length === 1) {
    const body = await readJsonObject(request);
    const notification = await createNotification(env.DB, {
      type: requireString(body.type, "type"),
      message: getString(body.message) ?? null,
      userId: requireString(body.userId, "userId"),
      actorId: requireString(body.actorId, "actorId"),
      postId: getInteger(body.postId) ?? null,
      read: getBoolean(body.read) ?? false,
    });
    return jsonResponse(env, request, notification);
  }

  if (method === "GET" && parts[1] === "unread-count") {
    const count = parseCount(await firstRow(env.DB, `SELECT COUNT(*) AS "count" FROM "Notification" WHERE "userId" = ? AND "read" = false`, authUser.id));
    return jsonResponse(env, request, { count });
  }

  if (method === "PATCH" && parts[1] === "mark-all-read") {
    await run(env.DB, `UPDATE "Notification" SET "read" = true, "updatedAt" = ? WHERE "userId" = ? AND "read" = false`, new Date().toISOString(), authUser.id);
    return emptyResponse(env, request, 204);
  }

  if (parts[1]) {
    const id = parseId(parts[1]);
    if (method === "GET") {
      return jsonResponse(env, request, await getNotification(env.DB, id));
    }
    if (method === "PATCH" && parts[2] === "read") {
      await run(env.DB, `UPDATE "Notification" SET "read" = true, "updatedAt" = ? WHERE "id" = ?`, new Date().toISOString(), id);
      return jsonResponse(env, request, await getNotification(env.DB, id));
    }
    if (method === "PATCH") {
      const body = await readJsonObject(request);
      const updates: string[] = [];
      const values: unknown[] = [];
      const type = getString(body.type);
      const message = getString(body.message);
      const read = getBoolean(body.read);
      if (type !== undefined) {
        updates.push(`"type" = ?`);
        values.push(type);
      }
      if (message !== undefined) {
        updates.push(`"message" = ?`);
        values.push(message);
      }
      if (read !== undefined) {
        updates.push(`"read" = ?`);
        values.push(read);
      }
      if (updates.length === 0) {
        throw new HttpError(400, "No update fields");
      }
      updates.push(`"updatedAt" = ?`);
      values.push(new Date().toISOString(), id);
      await run(
        env.DB,
        `UPDATE "Notification" SET ${updates.join(", ")} WHERE "id" = ?`,
        ...values,
      );
      return jsonResponse(env, request, await getNotification(env.DB, id));
    }
    if (method === "DELETE") {
      await run(env.DB, `DELETE FROM "Notification" WHERE "id" = ?`, id);
      return emptyResponse(env, request, 204);
    }
  }

  throw new HttpError(404, "Not found");
}

async function handleAdmin(
  request: Request,
  env: Env,
  parts: string[],
): Promise<Response> {
  const authUser = await requireAuthUser(request, env);
  const user = await findUserById(env.DB, authUser.id);
  const isAdmin = Boolean(user?.isAdmin);

  if (request.method === "GET" && parts[1] === "status") {
    return jsonResponse(env, request, { isAdmin });
  }

  if (!isAdmin) {
    throw new HttpError(401, "Admin access required");
  }

  if (request.method === "GET" && parts[1] === "settings") {
    return jsonResponse(env, request, await getSettings(env.DB));
  }

  if (request.method === "POST" && parts[1] === "toggle-secrets") {
    const body = await readJsonObject(request);
    const isRevealedSecrets = getBoolean(body.isRevealedSecrets);
    if (isRevealedSecrets === undefined) {
      throw new HttpError(400, "isRevealedSecrets is required");
    }
    await run(
      env.DB,
      `UPDATE "Settings" SET "isRevealedSecrets" = ?, "updatedAt" = ? WHERE "id" = 1`,
      isRevealedSecrets,
      new Date().toISOString(),
    );
    return jsonResponse(env, request, await getSettings(env.DB));
  }

  throw new HttpError(404, "Not found");
}

async function handleMetadata(request: Request, env: Env): Promise<Response> {
  await requireAuthUser(request, env);
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/metadata/clear-cache") {
    await run(env.DB, `DELETE FROM "UrlMetadataCache"`);
    return jsonResponse(env, request, { message: "All cache cleared successfully", deletedCount: 0 });
  }
  if (request.method !== "GET") {
    throw new HttpError(404, "Not found");
  }
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) {
    throw new HttpError(400, "URL parameter is required");
  }
  return jsonResponse(env, request, await getUrlMetadata(env.DB, targetUrl));
}

async function readPostInput(
  request: Request,
  env: Env,
  authorId: string,
): Promise<PostInput> {
  if (isMultipart(request)) {
    const formData = await request.formData();
    const images = await savePostImages(env, formData.getAll("images"));
    return {
      title: formString(formData, "title"),
      content: formString(formData, "content"),
      images,
      imagesPublic: formBoolean(formData, "imagesPublic") ?? false,
      url: formString(formData, "url"),
      authorId,
      replyToId: formInteger(formData, "replyToId"),
      characterId: formInteger(formData, "characterId"),
    };
  }

  const body = await readJsonObject(request);
  return {
    title: getString(body.title),
    content: getString(body.content),
    images: getStringArray(body.images),
    imagesPublic: getBoolean(body.imagesPublic) ?? false,
    url: getString(body.url),
    authorId,
    replyToId: getInteger(body.replyToId),
    characterId: getInteger(body.characterId),
  };
}

async function readPostUpdateInput(
  request: Request,
  env: Env,
  authorId: string,
): Promise<PostUpdateInput> {
  if (isMultipart(request)) {
    const formData = await request.formData();
    const uploadedImages = await savePostImages(env, formData.getAll("images"));
    return {
      title: formString(formData, "title"),
      content: formString(formData, "content"),
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      imagesPublic: formBoolean(formData, "imagesPublic"),
      url: formString(formData, "url"),
      published: formBoolean(formData, "published"),
    };
  }

  const body = await readJsonObject(request);
  return {
    title: getString(body.title),
    content: getString(body.content),
    images: body.images === undefined ? undefined : getStringArray(body.images),
    imagesPublic: getBoolean(body.imagesPublic),
    url: getString(body.url),
    published: getBoolean(body.published),
  };
}

async function createPost(db: D1Database, input: PostInput): Promise<Post> {
  if (!(await findUserById(db, input.authorId))) {
    throw new HttpError(400, `User with id ${input.authorId} does not exist`);
  }
  if (input.characterId && !(await getOwnedCharacter(db, input.characterId, input.authorId))) {
    throw new HttpError(400, "Character does not exist or does not belong to the user");
  }
  if (input.replyToId && !(await getPost(db, input.replyToId))) {
    throw new HttpError(400, `Post with id ${input.replyToId} does not exist`);
  }
  const now = new Date().toISOString();
  const result = await run(
    db,
    `INSERT INTO "Post" (
      "title", "content", "images", "imagesPublic", "url", "published",
      "createdAt", "updatedAt", "deletedAt", "authorId", "characterId", "replyToId"
    ) VALUES (?, ?, ?, ?, ?, true, ?, ?, NULL, ?, ?, ?)`,
    input.title ? sanitizeContent(input.title) : null,
    input.content ? sanitizeContentPreservingUrls(input.content) : null,
    serializeImages(input.images),
    input.imagesPublic,
    input.url ? sanitizeContent(input.url) : null,
    now,
    now,
    input.authorId,
    input.characterId ?? null,
    input.replyToId ?? null,
  );
  const postId = result.meta.last_row_id;
  if (typeof postId !== "number") {
    throw new Error("Failed to get created post id");
  }
  if (input.characterId) {
    await run(db, `UPDATE "Character" SET "postsCount" = "postsCount" + 1, "updatedAt" = ? WHERE "id" = ?`, now, input.characterId);
  }
  if (input.replyToId) {
    await createReplyNotification(db, input.replyToId, input.authorId);
  }
  return requireRow(await getPostRow(db, postId), parsePost, "Post not found");
}

async function updatePost(
  db: D1Database,
  postId: number,
  input: PostUpdateInput,
): Promise<void> {
  const updates: string[] = [];
  const values: unknown[] = [];
  if (input.title !== undefined) {
    updates.push(`"title" = ?`);
    values.push(input.title ? sanitizeContent(input.title) : null);
  }
  if (input.content !== undefined) {
    updates.push(`"content" = ?`);
    values.push(
      input.content ? sanitizeContentPreservingUrls(input.content) : null,
    );
  }
  if (input.images !== undefined) {
    updates.push(`"images" = ?`);
    values.push(serializeImages(input.images));
  }
  if (input.imagesPublic !== undefined) {
    updates.push(`"imagesPublic" = ?`);
    values.push(input.imagesPublic);
  }
  if (input.url !== undefined) {
    updates.push(`"url" = ?`);
    values.push(input.url ? sanitizeContent(input.url) : null);
  }
  if (input.published !== undefined) {
    updates.push(`"published" = ?`);
    values.push(input.published);
  }
  updates.push(`"updatedAt" = ?`);
  values.push(new Date().toISOString(), postId);
  await run(
    db,
    `UPDATE "Post" SET ${updates.join(", ")} WHERE "id" = ?`,
    ...values,
  );
}

async function softDeletePost(db: D1Database, post: Post): Promise<void> {
  const now = new Date().toISOString();
  await run(
    db,
    `UPDATE "Post" SET "deletedAt" = ?, "content" = NULL, "title" = NULL, "images" = NULL, "updatedAt" = ? WHERE "id" = ?`,
    now,
    now,
    post.id,
  );
  if (!post.characterId) {
    return;
  }
  const character = await getCharacter(db, post.characterId);
  if (!character || character.postsCount <= 0) {
    return;
  }
  if (character.postsCount === 1) {
    await run(db, `DELETE FROM "Character" WHERE "id" = ?`, post.characterId);
    return;
  }
  await run(
    db,
    `UPDATE "Character" SET "postsCount" = "postsCount" - 1, "updatedAt" = ? WHERE "id" = ?`,
    now,
    post.characterId,
  );
}

async function findPosts(
  db: D1Database,
  filters: { type: string | null; userId: string | null; search: string | null },
): Promise<Post[]> {
  if (filters.type === "liked" && filters.userId) {
    const rows = await allRows(
      db,
      `SELECT p.*
       FROM "Like" l
       JOIN "Post" p ON p."id" = l."postId"
       WHERE l."userId" = ? AND p."deletedAt" IS NULL
       ORDER BY l."createdAt" DESC`,
      filters.userId,
    );
    return rows.map(parsePost);
  }

  const conditions = [`"deletedAt" IS NULL`];
  const params: unknown[] = [];
  if (filters.userId) {
    conditions.push(`"authorId" = ?`);
    params.push(filters.userId);
  }
  if (filters.type === "media") {
    conditions.push(`"images" IS NOT NULL`);
  }
  if (filters.search) {
    conditions.push(`("content" LIKE ? OR "title" LIKE ?)`);
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  const rows = await allRows(
    db,
    `SELECT * FROM "Post" WHERE ${conditions.join(" AND ")} ORDER BY "createdAt" DESC`,
    ...params,
  );
  return rows
    .map(parsePost)
    .filter((post) => filters.type !== "media" || post.images.length > 0);
}

async function getPostResponse(
  db: D1Database,
  id: number,
  currentUserId?: string,
): Promise<Post> {
  const post = await getPost(db, id);
  if (!post) {
    throw new HttpError(404, "Post not found");
  }
  const [enriched] = await enrichPosts(db, [post], currentUserId);
  if (!enriched) {
    throw new HttpError(404, "Post not found");
  }
  return enriched;
}

async function enrichPosts(
  db: D1Database,
  posts: Post[],
  currentUserId?: string,
): Promise<Post[]> {
  const revealSecrets = await shouldRevealSecrets(db);
  return Promise.all(
    posts.map(async (post) => {
      const author = post.authorId ? await findUserById(db, post.authorId) : null;
      const character = post.characterId ? await getCharacter(db, post.characterId) : null;
      const replyTo = post.replyToId ? await getPost(db, post.replyToId) : null;
      const replyToAuthor = replyTo?.authorId
        ? await findUserById(db, replyTo.authorId)
        : null;
      const likes = await getLikesForPost(db, post.id);
      const repliesCount = parseCount(await firstRow(db, `SELECT COUNT(*) AS "count" FROM "Post" WHERE "replyToId" = ? AND "deletedAt" IS NULL`, post.id));
      return {
        ...post,
        images: post.images,
        author,
        character: await hideCharacterNameIfNeeded(db, character, currentUserId, post.authorId),
        url: await hideUrlIfNeeded(db, post.url, currentUserId, post.authorId),
        replyTo: replyTo
          ? {
              ...replyTo,
              author: replyToAuthor,
              images: replyTo.images,
            }
          : null,
        likes,
        _count: {
          likes: likes.length,
          replies: repliesCount,
        },
      };
    }),
  );
}

function canReadOriginalImage(
  revealSecrets: boolean,
  post: Post,
  currentUserId?: string,
): boolean {
  return revealSecrets || post.imagesPublic || (currentUserId !== undefined && post.authorId === currentUserId);
}

async function broadcastPostCreated(
  env: Env,
  postId: number,
  authorId: string,
): Promise<void> {
  try {
    await realtimeHub(env).fetch(
      new Request("https://realtime/broadcast", {
        method: "POST",
        body: JSON.stringify({ type: "post-created", postId, authorId }),
        headers: { "Content-Type": "application/json" },
      }),
    );
  } catch (error) {
    console.error("Failed to broadcast post-created event:", error);
  }
}

function realtimeHub(env: Env): DurableObjectStub {
  const id = env.REALTIME.idFromName("global");
  return env.REALTIME.get(id);
}

async function handleImage(
  request: Request,
  env: Env,
  filename: string,
): Promise<Response> {
  const authUser = await requireAuthUser(request, env);
  const row = await firstRow(
    env.DB,
    `SELECT * FROM "Post" WHERE instr("images", ?) > 0 LIMIT 1`,
    JSON.stringify(filename),
  );
  const post = row ? parsePost(row) : undefined;
  if (!post) {
    throw new HttpError(404, "Image not found");
  }
  const canReadOriginal = canReadOriginalImage(await shouldRevealSecrets(env.DB), post, authUser.id);
  if (!canReadOriginal) {
    const mosaic = await env.ASSETS.get(mosaicImageFilename(filename));
    if (!mosaic) {
      throw new HttpError(500, "Mosaic image is missing");
    }
    return createMosaicImageResponse({ mosaic });
  }
  const object = await env.ASSETS.get(filename);
  if (!object) {
    throw new HttpError(404, "Image not found");
  }
  const contentType = object.httpMetadata?.contentType ?? contentTypeForImageFilename(filename);
  if (!contentType) {
    throw new HttpError(500, "Image content type is missing");
  }
  return new Response(object.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

async function toggleLike(
  db: D1Database,
  postId: number,
  userId: string,
): Promise<{ liked: boolean }> {
  if (!(await getPost(db, postId))) {
    throw new HttpError(400, "Post not found");
  }
  const existing = await firstRow(
    db,
    `SELECT * FROM "Like" WHERE "userId" = ? AND "postId" = ?`,
    userId,
    postId,
  );
  if (existing) {
    await run(db, `DELETE FROM "Like" WHERE "userId" = ? AND "postId" = ?`, userId, postId);
    await removeLikeNotification(db, postId, userId);
    return { liked: false };
  }
  await run(
    db,
    `INSERT INTO "Like" ("userId", "postId", "createdAt") VALUES (?, ?, ?)`,
    userId,
    postId,
    new Date().toISOString(),
  );
  await createLikeNotification(db, postId, userId);
  return { liked: true };
}

async function getPostLikes(
  db: D1Database,
  postId: number,
): Promise<{ count: number; users: User[] }> {
  const rows = await allRows(
    db,
    `SELECT u.*
     FROM "Like" l
     JOIN "User" u ON u."id" = l."userId"
     WHERE l."postId" = ?
     ORDER BY l."createdAt" DESC`,
    postId,
  );
  const users = rows.map(parseUser);
  return { count: users.length, users };
}

async function getNotifications(
  db: D1Database,
  userId: string,
): Promise<Notification[]> {
  const rows = await allRows(
    db,
    `SELECT * FROM "Notification" WHERE "userId" = ? ORDER BY "createdAt" DESC`,
    userId,
  );
  return Promise.all(rows.map((row) => enrichNotification(db, parseNotification(row))));
}

async function getNotification(db: D1Database, id: number): Promise<Notification> {
  const row = await firstRow(db, `SELECT * FROM "Notification" WHERE "id" = ?`, id);
  return enrichNotification(db, requireRow(row, parseNotification, "Notification not found"));
}

async function enrichNotification(
  db: D1Database,
  notification: Notification,
): Promise<Notification> {
  const actor = await findUserById(db, notification.actorId);
  const post = notification.postId ? await getPost(db, notification.postId) : null;
  const postAuthor = post?.authorId ? await findUserById(db, post.authorId) : null;
  return {
    ...notification,
    actor: actor ? { id: actor.id, name: actor.name, image: actor.image } : undefined,
    post: post
      ? {
          id: post.id,
          content: post.content,
          author: postAuthor ? { id: postAuthor.id, name: postAuthor.name } : null,
        }
      : null,
  };
}

async function createNotification(
  db: D1Database,
  input: {
    type: string;
    message: string | null;
    userId: string;
    actorId: string;
    postId: number | null;
    read: boolean;
  },
): Promise<Notification | null> {
  if (input.userId === input.actorId) {
    return null;
  }
  const now = new Date().toISOString();
  const result = await run(
    db,
    `INSERT INTO "Notification" ("type", "message", "read", "createdAt", "updatedAt", "userId", "actorId", "postId")
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.type,
    input.message,
    input.read,
    now,
    now,
    input.userId,
    input.actorId,
    input.postId,
  );
  const id = result.meta.last_row_id;
  if (typeof id !== "number") {
    throw new Error("Failed to get created notification id");
  }
  return getNotification(db, id);
}

async function createLikeNotification(
  db: D1Database,
  postId: number,
  actorId: string,
): Promise<void> {
  const post = await getPost(db, postId);
  if (!post?.authorId) {
    return;
  }
  const existing = await firstRow(
    db,
    `SELECT * FROM "Notification" WHERE "type" = 'like' AND "postId" = ? AND "actorId" = ? AND "userId" = ?`,
    postId,
    actorId,
    post.authorId,
  );
  if (existing) {
    return;
  }
  await createNotification(db, {
    type: "like",
    message: "があなたの投稿にいいねしました",
    userId: post.authorId,
    actorId,
    postId,
    read: false,
  });
}

async function removeLikeNotification(
  db: D1Database,
  postId: number,
  actorId: string,
): Promise<void> {
  const post = await getPost(db, postId);
  if (!post?.authorId) {
    return;
  }
  await run(
    db,
    `DELETE FROM "Notification" WHERE "type" = 'like' AND "postId" = ? AND "actorId" = ? AND "userId" = ?`,
    postId,
    actorId,
    post.authorId,
  );
}

async function createFollowNotification(
  db: D1Database,
  userId: string,
  actorId: string,
): Promise<void> {
  const existing = await firstRow(
    db,
    `SELECT * FROM "Notification" WHERE "type" = 'follow' AND "userId" = ? AND "actorId" = ?`,
    userId,
    actorId,
  );
  if (existing) {
    return;
  }
  await createNotification(db, {
    type: "follow",
    message: "があなたをフォローしました",
    userId,
    actorId,
    postId: null,
    read: false,
  });
}

async function createReplyNotification(
  db: D1Database,
  postId: number,
  actorId: string,
): Promise<void> {
  const post = await getPost(db, postId);
  if (!post?.authorId) {
    return;
  }
  await createNotification(db, {
    type: "reply",
    message: "があなたの投稿に返信しました",
    userId: post.authorId,
    actorId,
    postId,
    read: false,
  });
}

async function getUrlMetadata(db: D1Database, rawUrl: string): Promise<Record<string, unknown>> {
  const validUrl = new URL(rawUrl);
  if (validUrl.protocol !== "http:" && validUrl.protocol !== "https:") {
    throw new HttpError(400, "Invalid protocol");
  }
  const cached = await firstRow(
    db,
    `SELECT * FROM "UrlMetadataCache" WHERE "url" = ? AND "expiresAt" > ?`,
    rawUrl,
    new Date().toISOString(),
  );
  if (cached) {
    return {
      url: cached.url,
      title: cached.title,
      description: cached.description,
      image: cached.image,
      siteName: cached.siteName,
      type: cached.type,
      favicon: cached.favicon,
      cachedAt: cached.createdAt,
    };
  }
  const response = await fetch(validUrl.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; NatterBot/1.0)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!response.ok) {
    throw new HttpError(502, `Failed to fetch URL: ${response.status}`);
  }
  const html = await response.text();
  const metadata = parseMetadataHtml(html, validUrl);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await run(
    db,
    `INSERT OR REPLACE INTO "UrlMetadataCache" (
      "url", "title", "description", "image", "siteName", "type", "favicon", "createdAt", "updatedAt", "expiresAt"
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    rawUrl,
    metadata.title ?? null,
    metadata.description ?? null,
    metadata.image ?? null,
    metadata.siteName ?? null,
    metadata.type ?? null,
    metadata.favicon ?? null,
    now.toISOString(),
    now.toISOString(),
    expiresAt,
  );
  return { url: rawUrl, ...metadata, cachedAt: now.toISOString() };
}

function parseMetadataHtml(html: string, baseUrl: URL): Record<string, string | undefined> {
  const title = findMeta(html, "property", "og:title") ?? findMeta(html, "name", "twitter:title") ?? findTitle(html);
  const description = findMeta(html, "property", "og:description") ?? findMeta(html, "name", "twitter:description") ?? findMeta(html, "name", "description");
  const imageValue = findMeta(html, "property", "og:image") ?? findMeta(html, "name", "twitter:image") ?? findMeta(html, "name", "twitter:image:src");
  const faviconValue = findLink(html, "icon") ?? findLink(html, "shortcut icon") ?? findLink(html, "apple-touch-icon") ?? "/favicon.ico";
  return {
    title: title ? truncate(title, 100) : undefined,
    description: description ? truncate(description, 200) : undefined,
    image: imageValue ? new URL(imageValue, baseUrl).toString() : undefined,
    siteName: findMeta(html, "property", "og:site_name"),
    type: findMeta(html, "property", "og:type"),
    favicon: faviconValue ? new URL(faviconValue, baseUrl).toString() : undefined,
  };
}

function findMeta(html: string, attribute: string, value: string): string | undefined {
  const pattern = new RegExp(`<meta[^>]+${attribute}=["']${escapeRegExp(value)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  return decodeHtml(pattern.exec(html)?.[1]);
}

function findLink(html: string, rel: string): string | undefined {
  const pattern = new RegExp(`<link[^>]+rel=["']${escapeRegExp(rel)}["'][^>]+href=["']([^"']+)["'][^>]*>`, "i");
  return decodeHtml(pattern.exec(html)?.[1]);
}

function findTitle(html: string): string | undefined {
  return decodeHtml(/<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1]?.trim());
}

function decodeHtml(value: string | undefined): string | undefined {
  return value
    ?.replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'");
}

function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 3)}...` : value;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getSettings(db: D1Database): Promise<Record<string, unknown>> {
  const row = await firstRow(db, `SELECT * FROM "Settings" WHERE "id" = 1`);
  if (!row) {
    throw new HttpError(500, "Settings row is missing");
  }
  return row;
}

async function getRecommendedUsers(
  db: D1Database,
  limit: number,
  excludeUserId: string,
): Promise<User[]> {
  const rows = await allRows(
    db,
    `SELECT u.*, COUNT(p."id") AS "posts"
     FROM "User" u
     LEFT JOIN "Post" p ON p."authorId" = u."id" AND p."deletedAt" IS NULL
     WHERE u."id" != ?
     GROUP BY u."id"
     ORDER BY COUNT(p."id") DESC, u."createdAt" DESC
     LIMIT ?`,
    excludeUserId,
    limit,
  );
  return rows.map((row) => ({
    ...parseUser(row),
    _count: { posts: Number(row.posts ?? 0), likes: 0 },
  }));
}

async function getCharactersByUser(
  db: D1Database,
  userId: string,
  currentUserId?: string,
): Promise<Character[]> {
  const rows = await allRows(
    db,
    `SELECT c.*, COUNT(p."id") AS "posts"
     FROM "Character" c
     LEFT JOIN "Post" p ON p."characterId" = c."id"
     WHERE c."userId" = ?
     GROUP BY c."id"
     ORDER BY c."createdAt" DESC`,
    userId,
  );
  return Promise.all(
    rows.map(async (row) => {
      const character = characterWithCount(row);
      return hideCharacterNameIfNeeded(db, character, currentUserId, userId) as Promise<Character>;
    }),
  );
}

function characterWithCount(row: Record<string, unknown>): Character {
  const character = parseCharacter(row);
  return {
    ...character,
    _count: { posts: Number(row.posts ?? 0) },
  };
}

async function findUserById(db: D1Database, id: string): Promise<User | undefined> {
  const row = await getUserRowById(db, id);
  return row ? parseUser(row) : undefined;
}

async function findUserWithCounts(db: D1Database, id: string): Promise<User | undefined> {
  const user = await findUserById(db, id);
  if (!user) {
    return undefined;
  }
  const posts = parseCount(await firstRow(db, `SELECT COUNT(*) AS "count" FROM "Post" WHERE "authorId" = ? AND "deletedAt" IS NULL`, id));
  const likes = parseCount(await firstRow(db, `SELECT COUNT(*) AS "count" FROM "Like" WHERE "userId" = ?`, id));
  const following = parseCount(await firstRow(db, `SELECT COUNT(*) AS "count" FROM "Follow" WHERE "followerId" = ?`, id));
  const followers = parseCount(await firstRow(db, `SELECT COUNT(*) AS "count" FROM "Follow" WHERE "followingId" = ?`, id));
  return { ...user, _count: { posts, likes, following, followers } };
}

async function getUserRowById(db: D1Database, id: string): Promise<Record<string, unknown> | undefined> {
  return firstRow(db, `SELECT * FROM "User" WHERE "id" = ?`, id);
}

async function getPost(db: D1Database, id: number): Promise<Post | undefined> {
  const row = await getPostRow(db, id);
  return row ? parsePost(row) : undefined;
}

async function getPostRow(db: D1Database, id: number): Promise<Record<string, unknown> | undefined> {
  return firstRow(db, `SELECT * FROM "Post" WHERE "id" = ?`, id);
}

async function getCharacter(db: D1Database, id: number): Promise<Character | null> {
  const row = await firstRow(db, `SELECT * FROM "Character" WHERE "id" = ?`, id);
  return row ? parseCharacter(row) : null;
}

async function getOwnedCharacter(db: D1Database, id: number, userId: string): Promise<Character | null> {
  const row = await firstRow(db, `SELECT * FROM "Character" WHERE "id" = ? AND "userId" = ?`, id, userId);
  return row ? parseCharacter(row) : null;
}

async function getLikesForPost(db: D1Database, postId: number): Promise<Like[]> {
  const rows = await allRows(db, `SELECT * FROM "Like" WHERE "postId" = ? ORDER BY "createdAt" DESC`, postId);
  return Promise.all(
    rows.map(async (row) => {
      const like = parseLike(row);
      return { ...like, user: await findUserById(db, like.userId) };
    }),
  );
}

async function getFollow(
  db: D1Database,
  followerId: string,
  followingId: string,
): Promise<Record<string, unknown> | undefined> {
  return firstRow(
    db,
    `SELECT * FROM "Follow" WHERE "followerId" = ? AND "followingId" = ?`,
    followerId,
    followingId,
  );
}
