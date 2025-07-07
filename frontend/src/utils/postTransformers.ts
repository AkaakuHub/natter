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
    updatedAt: post.updatedAt || post.createdAt,
    published: post.published ?? true,
    liked: post.likes?.map((like) => like.userId) || [],
    _count: post._count,
    replyTo: post.replyTo
      ? {
          id: post.replyTo.id,
          userId: post.replyTo.author?.id || "",
          content: post.replyTo.content || "",
          images: [],
          createdAt: post.replyTo.createdAt || post.createdAt,
          updatedAt:
            post.replyTo.updatedAt || post.replyTo.createdAt || post.createdAt,
          published: true,
          liked: [],
          _count: { likes: 0, replies: 0 },
          replyTo: undefined,
          author: {
            id: post.replyTo.author?.id || "",
            name: post.replyTo.author?.name || "",
            twitterId: post.replyTo.author?.twitterId || "",
            image: post.replyTo.author?.image || "/no_avatar_image_128x128.png",
            createdAt: post.replyTo.author?.createdAt || post.createdAt,
            updatedAt:
              post.replyTo.author?.updatedAt ||
              post.replyTo.author?.createdAt ||
              post.createdAt,
          },
        }
      : undefined,
  };

  return { transformedUser, transformedPost };
};

// Backward compatibility
export const transformReplyToPostComponent = transformPostToPostComponent;
