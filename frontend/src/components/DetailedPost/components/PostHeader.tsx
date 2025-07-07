import React from "react";
import Image from "next/image";
import { formatDate } from "@/utils/postUtils";

interface PostHeaderProps {
  user?: {
    id?: string;
    name?: string;
    image?: string;
  };
  createdAt: string | number | Date;
  onUserClick: () => void;
}

const PostHeader = ({ user, createdAt, onUserClick }: PostHeaderProps) => {
  return (
    <div className="p-6 border-b border-gray-100/60">
      <div className="flex items-start space-x-4">
        <button onClick={onUserClick} className="flex-shrink-0">
          <Image
            src={user?.image || "/no_avatar_image_128x128.png"}
            alt={`${user?.name}'s avatar`}
            width={56}
            height={56}
            className="rounded-full ring-2 ring-gray-200 hover:ring-blue-200 transition-all duration-300 hover:scale-105"
          />
        </button>
        <div className="flex-1 min-w-0">
          <button onClick={onUserClick} className="hover:underline block mb-1">
            <h1 className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors duration-300">
              {user?.name}
            </h1>
          </button>
          <p className="text-gray-500 text-sm mb-2">@{user?.id}</p>
          <time className="text-xs text-gray-400">{formatDate(createdAt)}</time>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
