"use client";

import React, { useState, useEffect } from "react";
import BaseLayout from "@/components/layout/BaseLayout";

import Image from "next/image";
import Link from "next/link";
import { IconHeart, IconMessageCircle, IconShare, IconArrowLeft } from "@tabler/icons-react";
import { PostsApi, Post } from "@/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

interface DetailedPostComponentProps {
  postId: string;
}

const DetailedPostComponent = ({ postId }: DetailedPostComponentProps) => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const fetchedPost = await PostsApi.getPostById(parseInt(postId));
        setPost(fetchedPost);
        setIsLiked(currentUserId ? fetchedPost.likes?.some(like => like.userId === currentUserId) || false : false);
        setLikeCount(fetchedPost.likes?.length || 0);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, currentUserId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking || !currentUserId || !post) return;
    
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

  const formatDate = (date: string | number | Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Intl.DateTimeFormat("ja-JP", options).format(new Date(date));
  };

  if (loading) {
    return (
      <BaseLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (error || !post) {
    return (
      <BaseLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="text-red-500 text-lg font-medium">
                {error || "ポストが見つかりませんでした"}
              </div>
              <button 
                onClick={() => router.back()}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  const user = post.author;

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Back button */}
          <button 
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <IconArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">戻る</span>
          </button>

          {/* Main post card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* User header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <Link href={`/profile?userId=${user?.id}`} className="flex-shrink-0">
                  <Image
                    src={user?.image || "/no_avatar_image_128x128.png"}
                    alt={`${user?.name}'s avatar`}
                    width={56}
                    height={56}
                    className="rounded-full ring-2 ring-gray-200 hover:ring-blue-300 transition-all duration-200"
                  />
                </Link>
                <div className="flex-1">
                  <Link href={`/profile?userId=${user?.id}`} className="hover:underline">
                    <h1 className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors">
                      {user?.name}
                    </h1>
                  </Link>
                  <p className="text-gray-500 text-sm mt-1">
                    @{user?.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Post content */}
            <div className="p-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div className={`mt-6 ${post.images.length === 1 ? 'flex justify-center' : 'grid grid-cols-2 gap-3'}`}>
                  {post.images.map((image, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl">
                      <Image
                        src={image}
                        alt={`Post image ${idx + 1}`}
                        width={512}
                        height={512}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-around">
                <button 
                  onClick={handleLike}
                  disabled={isLiking || !currentUserId}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    isLiked 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                  } ${isLiking || !currentUserId ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  <IconHeart 
                    size={20} 
                    fill={isLiked ? 'currentColor' : 'none'} 
                    className={isLiked ? 'animate-pulse' : ''}
                  />
                  <span className="font-medium">{likeCount}</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-105">
                  <IconMessageCircle size={20} />
                  <span className="font-medium">0</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all duration-200 hover:scale-105">
                  <IconShare size={20} />
                  <span className="font-medium">シェア</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default DetailedPostComponent;