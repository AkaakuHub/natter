"use client";

import React, { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";

import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { PostsApi } from "@/api";
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  // 仮のユーザーID（実際のアプリでは認証されたユーザーIDを使用）
  const currentUserId = 1;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // propsが変更されたときに状態を同期
  useEffect(() => {
    setIsLiked(post.liked?.includes(currentUserId) || false);
    setLikeCount(post.liked?.length || 0);
  }, [post.liked, currentUserId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      const response = await PostsApi.likePost(post.id, currentUserId);
      
      setIsLiked(response.liked);
      setLikeCount(prev => response.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="border-b border-gray-200 py-4 px-4 flex gap-4">
      <Link href={`/profile?userId=${user?.id}`} className="flex-shrink-0">
        <Image
          src={user?.image || "no_avatar_image_128x128.png"}
          alt={user?.name || "User"}
          className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
          width={48}
          height={48}
        />
      </Link>
      <div className="flex-1" onClick={() => router.push(`/post/${post?.id}`)}>
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/profile?userId=${user?.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                <span className="font-bold">
                  {user?.name || "Unknown User"}
                </span>
              </Link>
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
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 hover:text-red-500 w-[calc(100% / 3)] justify-center transition-colors ${
              isLiked ? 'text-red-500' : ''
            } ${isLiking ? 'opacity-50' : ''}`}
          >
            <IconHeart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500 w-[calc(100% / 3)] justify-center">
            <IconMessageCircle size={20} />
            <span>0</span>
          </button>
          <button className="flex items-center gap-1 hover:text-green-500 w-[calc(100% / 3)] justify-center">
            <IconShare size={20} />
          </button>
        </div>
      </div>
    </div>
  )
};

export default PostComponent;