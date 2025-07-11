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
