import React from "react";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";

interface PostActionsProps {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  repliesCount: number;
  onLike: (e: React.MouseEvent) => void;
  onReply: () => void;
  canInteract: boolean;
}

const PostActions = ({
  isLiked,
  likeCount,
  isLiking,
  repliesCount,
  onLike,
  onReply,
  canInteract,
}: PostActionsProps) => {
  return (
    <div className="px-6 py-4 border-t border-gray-100/60 bg-gray-50/30">
      <div className="flex items-center justify-around">
        <button
          onClick={onLike}
          disabled={isLiking || !canInteract}
          className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
            isLiked
              ? "text-red-500 bg-red-50 hover:bg-red-100"
              : "text-gray-600 hover:text-red-500 hover:bg-red-50"
          } ${isLiking || !canInteract ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <IconHeart
            size={20}
            fill={isLiked ? "currentColor" : "none"}
            className={isLiked ? "animate-pulse" : ""}
          />
          <span className="font-medium">{likeCount}</span>
        </button>

        <button
          onClick={onReply}
          className="flex items-center gap-2 px-4 py-3 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
        >
          <IconMessageCircle size={20} />
          <span className="font-medium">{repliesCount}</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-3 rounded-full text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all duration-300 hover:scale-105">
          <IconShare size={20} />
          <span className="font-medium">シェア</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
