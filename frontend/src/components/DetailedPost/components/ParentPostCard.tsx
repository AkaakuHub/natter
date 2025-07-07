import React from "react";
import ReplySourcePost from "@/components/shared/ReplySourcePost";

interface ParentPost {
  id: number;
  content?: string;
  images?: string[];
  author?: {
    name?: string;
    image?: string;
  };
}

interface ParentPostCardProps {
  parentPost: ParentPost;
  onParentPostClick: () => void;
}

const ParentPostCard = ({
  parentPost,
  onParentPostClick,
}: ParentPostCardProps) => {
  return (
    <ReplySourcePost
      post={{
        id: parentPost.id,
        content: parentPost.content,
        images: parentPost.images,
        author: parentPost.author,
      }}
      variant="detailed"
      onPostClick={onParentPostClick}
      showReplyLabel={true}
    />
  );
};

export default ParentPostCard;
