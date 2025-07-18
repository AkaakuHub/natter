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
    authorId: post.authorId || post.author.id,
    content: post.content || "",
    images: post.images || [],
    url: post.url || undefined,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt || post.createdAt,
    published: post.published ?? true,
    likes: post.likes || [],
    author: post.author,
    _count: post._count,
    replyTo: post.replyTo
      ? {
          id: post.replyTo.id,
          userId: post.replyTo.author?.id || "",
          content: post.replyTo.content || "",
          images: post.replyTo.images || [],
          createdAt: post.replyTo.createdAt || post.createdAt,
          updatedAt:
            post.replyTo.updatedAt || post.replyTo.createdAt || post.createdAt,
          published: true,
          likes: [],
          authorId: post.replyTo.authorId || post.replyTo.author?.id || "",
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
    replyToId: post.replyToId,
    character: post.character,
  };

  return { transformedUser, transformedPost };
};
