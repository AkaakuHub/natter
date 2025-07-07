import React from "react";
import { formatDate } from "@/utils/postUtils";

interface PostHeaderProps {
  user: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
  onUserClick: () => void;
}

const PostHeader = ({ user, createdAt, onUserClick }: PostHeaderProps) => {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <button
          className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-base"
          onClick={(e) => {
            e.stopPropagation();
            onUserClick();
          }}
        >
          {user?.name || "Unknown User"}
        </button>
        <span className="text-sm text-gray-500">@{user?.id || "unknown"}</span>
      </div>
      <time className="text-xs text-gray-400 block">
        {formatDate(createdAt)}
      </time>
    </div>
  );
};

export default PostHeader;
