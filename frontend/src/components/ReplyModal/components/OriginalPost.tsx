import React from "react";
import Image from "next/image";

interface OriginalPostProps {
  replyToPost: {
    id: number;
    content: string;
    author: {
      name: string;
      image?: string;
    };
  };
}

const OriginalPost = ({ replyToPost }: OriginalPostProps) => {
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex gap-3">
        <Image
          src={replyToPost.author.image || "/no_avatar_image_128x128.png"}
          alt={replyToPost.author.name}
          className="w-10 h-10 rounded-full"
          width={40}
          height={40}
        />
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">
            {replyToPost.author.name}
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {replyToPost.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalPost;
