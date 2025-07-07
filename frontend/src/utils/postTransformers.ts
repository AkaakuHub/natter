import { Post } from "@/api";

export const transformReplyToPostComponent = (reply: Post) => {
  if (!reply.author) return null;

  const transformedUser = {
    id: reply.author.id,
    name: reply.author.name,
    image: reply.author.image || "/no_avatar_image_128x128.png",
  };

  const transformedPost = {
    id: reply.id,
    userId: reply.authorId || "",
    content: reply.content || "",
    images: reply.images || [],
    createdAt: reply.createdAt,
    liked: reply.likes?.map((like) => like.userId) || [],
    _count: reply._count,
    replyTo: reply.replyTo
      ? {
          id: reply.replyTo.id,
          content: reply.replyTo.content || "",
          author: {
            id: reply.replyTo.author?.id || "",
            name: reply.replyTo.author?.name || "",
          },
        }
      : undefined,
  };

  return { transformedUser, transformedPost };
};
