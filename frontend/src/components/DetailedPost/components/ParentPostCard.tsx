import React from "react";
import Image from "next/image";
import { IconArrowLeft } from "@tabler/icons-react";

interface ParentPost {
  id: number;
  content?: string;
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
    <div className="p-6 bg-gray-50/50 border-b border-gray-100/60">
      <button
        onClick={onParentPostClick}
        className="w-full text-left hover:bg-gray-100 transition-all duration-300 p-4 rounded-2xl hover:scale-[1.02]"
      >
        <div className="flex items-center space-x-3">
          <Image
            src={
              parentPost.author?.image || "/no_avatar_image_128x128.png"
            }
            alt={`${parentPost.author?.name}'s avatar`}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-gray-200 hover:ring-blue-200 transition-all duration-300"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-600">返信先</p>
            <p className="font-semibold text-gray-900">
              {parentPost.author?.name}
            </p>
            <p className="text-gray-700 text-sm mt-1 line-clamp-2">
              {parentPost.content}
            </p>
          </div>
          <IconArrowLeft size={20} className="text-gray-400 rotate-180" />
        </div>
      </button>
    </div>
  );
};

export default ParentPostCard;