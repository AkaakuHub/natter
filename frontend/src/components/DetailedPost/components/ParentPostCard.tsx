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
  currentUserId?: string;
}

const ParentPostCard = ({
  parentPost,
  onParentPostClick,
  currentUserId,
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
      currentUserId={currentUserId}
    />
  );
};

export default ParentPostCard;
