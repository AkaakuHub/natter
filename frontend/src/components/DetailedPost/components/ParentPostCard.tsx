import React from "react";
import ReplySourcePost from "@/components/shared/ReplySourcePost";

interface ParentPost {
  id: number;
  content?: string;
  images?: string[];
  imagesPublic?: boolean;
  authorId?: string;
  author?: {
    id?: string;
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
        imagesPublic: parentPost.imagesPublic,
        authorId: parentPost.authorId,
        author: parentPost.author,
      }}
      variant="detailed"
      onPostClick={onParentPostClick}
      showReplyLabel={true}
    />
  );
};

export default ParentPostCard;
