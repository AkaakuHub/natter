import React from "react";

import Image from "next/image";
import Link from "next/link";

import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";

interface PostComponentProps {
  user: {
    id: number;
    name: string;
    image: string;
  },
  post: {
    id: number;
    userId: number;
    content: string;
    images?: string[];
    createdAt: string;
    liked?: number[];
  }
}

const formatDate = (date: string | number | Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("ja-JP", options).format(new Date(date));
};


const PostComponent = ({ user, post }: PostComponentProps) => {
  return (
    <Link
      href={`/posts/${post?.id}`}
      key={post.id}
    >
      <div
        className="border-b border-gray-200 py-4 px-4 flex gap-4"
      >
        <Image
          src={user?.image || "no_avatar_image_128x128.png"}
          alt={user?.name || "User"}
          className="w-12 h-12 rounded-full"
          width={48}
          height={48}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold">
                {user?.name || "Unknown User"}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                @{user?.id || "unknown"}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(post.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-gray-800">{post.content}</p>
          {post.images && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt="Post Image"
                  className="w-full h-auto rounded-md"
                  width={200}
                  height={200}
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-8 mt-2 text-gray-500">
            <button className="flex items-center gap-1 hover:text-red-500 w-[calc(100% / 3)] justify-center">
              <IconHeart size={20} />
              <span>10</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 w-[calc(100% / 3)] justify-center">
              <IconMessageCircle size={20} />
              <span>20</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 w-[calc(100% / 3)] justify-center">
              <IconShare size={20} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
};

export default PostComponent;