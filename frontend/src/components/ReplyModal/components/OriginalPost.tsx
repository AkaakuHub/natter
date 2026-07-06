import React from "react";
import ReplySourcePost from "@/components/shared/ReplySourcePost";

interface OriginalPostProps {
  replyToPost: {
    id: number;
    content: string;
    images?: string[];
    imagesPublic?: boolean;
    authorId?: string;
    author: {
      id?: string;
      name: string;
      image?: string;
    };
  };
  currentUserId?: string;
}

const OriginalPost = ({ replyToPost, currentUserId }: OriginalPostProps) => {
  return (
    <ReplySourcePost
      post={{
        id: replyToPost.id,
        content: replyToPost.content,
        images: replyToPost.images || [],
        imagesPublic: replyToPost.imagesPublic,
        authorId: replyToPost.authorId,
        author: replyToPost.author,
      }}
      variant="modal"
      currentUserId={currentUserId}
    />
  );
};

export default OriginalPost;
