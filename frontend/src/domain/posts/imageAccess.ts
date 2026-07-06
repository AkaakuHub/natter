import type { Post } from "@/api";

export function shouldFetchPostImageWithAuth(
  post: Pick<Post, "authorId" | "imagesPublic">,
  currentUserId?: string,
): boolean {
  if (post.imagesPublic === undefined) {
    return true;
  }
  return (
    post.imagesPublic || (!!currentUserId && post.authorId === currentUserId)
  );
}
