import { Post } from "@/api";

export const transformPostToPostComponent = (post: Post) => {
  if (!post.author) return null;

  const transformedUser = {
    id: post.author.id,
    name: post.author.name,
    image: post.author.image || "/no_avatar_image_128x128.png",
  };

  const transformedPost = {
    id: post.id,
    userId: post.authorId || "",
    content: post.content || "",
    images: post.images || [],
    createdAt: post.createdAt,
    liked: post.likes?.map((like) => like.userId) || [],
    _count: post._count,
    replyTo: post.replyTo
      ? {
          id: post.replyTo.id,
          content: post.replyTo.content || "",
          author: {
            id: post.replyTo.author?.id || "",
            name: post.replyTo.author?.name || "",
          },
        }
      : undefined,
  };

  return { transformedUser, transformedPost };
};

// Backward compatibility
export const transformReplyToPostComponent = transformPostToPostComponent;
