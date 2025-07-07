import React from "react";
import ReplySourcePost from "@/components/shared/ReplySourcePost";

interface OriginalPostProps {
  replyToPost: {
    id: number;
    content: string;
    images?: string[];
    author: {
      name: string;
      image?: string;
    };
  };
}

const OriginalPost = ({ replyToPost }: OriginalPostProps) => {
  // 一時的なデバッグログ
  console.log("🚨 REPLY MODAL ORIGINAL POST DEBUG:", {
    postId: replyToPost.id,
    modalImages: replyToPost.images,
    imageType: typeof replyToPost.images,
    isArray: Array.isArray(replyToPost.images),
    imageLength: replyToPost.images?.length || 0,
    stringifiedImages: JSON.stringify(replyToPost.images),
  });

  return (
    <ReplySourcePost
      post={{
        id: replyToPost.id,
        content: replyToPost.content,
        images: replyToPost.images || [],
        author: replyToPost.author,
      }}
      variant="modal"
    />
  );
};

export default OriginalPost;
