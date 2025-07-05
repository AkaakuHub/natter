"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { PostsApi } from "@/api";
import { useNavigation } from "@/hooks/useNavigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ImageModal from "@/components/ImageModal";

interface ReplyComponentProps {
  user: {
    id: string;
    name: string;
    image: string;
  };
  post: {
    id: number;
    userId: string;
    content: string;
    images?: string[];
    createdAt: string;
    liked?: string[];
    _count?: {
      replies: number;
    };
  };
  replyTo?: {
    author: {
      name: string;
    };
  };
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

const ReplyComponent = ({ user, post, replyTo }: ReplyComponentProps) => {
  const { navigateToPost, navigateToProfile } = useNavigation();
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsLiked(
      currentUserId ? post.liked?.includes(currentUserId) || false : false,
    );
    setLikeCount(post.liked?.length || 0);
  }, [post.liked, currentUserId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking || !currentUserId) return;

    try {
      setIsLiking(true);
      const response = await PostsApi.likePost(post.id, currentUserId);

      setIsLiked(response.liked);
      setLikeCount((prev) => (response.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImageIndex(-1);
  };

  const handlePreviousImage = () => {
    if (post.images && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (post.images && selectedImageIndex < post.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  return (
    <>
      <div className="py-3 px-4 flex gap-3">
        {/* リプライアイコンと線 */}
        <div className="flex flex-col items-center mr-1">
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 rounded-bl-lg"></div>
          </div>
          <div className="w-0.5 bg-gray-300 flex-1 min-h-4"></div>
        </div>

        {/* ユーザーアバター */}
        <button
          onClick={() => navigateToProfile(user?.id)}
          className="flex-shrink-0"
        >
          <Image
            src={user?.image || "no_avatar_image_128x128.png"}
            alt={user?.name || "User"}
            className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
            width={40}
            height={40}
          />
        </button>

        <div
          className="flex-1"
          onClick={() => post?.id && navigateToPost(post.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToProfile(user?.id);
                }}
              >
                <span className="font-bold text-sm">
                  {user?.name || "Unknown User"}
                </span>
              </button>
              <span className="text-xs text-gray-500 ml-2">
                @{user?.id || "unknown"}
              </span>
              {replyTo && (
                <span className="text-xs text-gray-500 ml-2">
                  • 返信先: @{replyTo.author.name}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(post.createdAt)}
            </span>
          </div>

          <p className="mt-1 text-gray-800 text-sm">{post.content}</p>

          {/* 画像表示 */}
          {post.images && post.images.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {post.images.map((image, index) => {
                const isFullUrl =
                  image.startsWith("http://") || image.startsWith("https://");
                const imageSrc = isFullUrl
                  ? image
                  : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${image}`;

                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(index);
                    }}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
                  >
                    <Image
                      src={imageSrc}
                      alt="Reply Image"
                      className="w-full h-auto rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                      width={150}
                      height={150}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex items-center gap-6 mt-2 text-gray-500 text-sm">
            <button
              onClick={handleLike}
              disabled={isLiking || !currentUserId}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                isLiked ? "text-red-500" : ""
              } ${isLiking || !currentUserId ? "opacity-50" : ""}`}
            >
              <IconHeart size={16} fill={isLiked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <IconMessageCircle size={16} />
              <span>{post._count?.replies || 0}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
              <IconShare size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 画像モーダル */}
      {isModalOpen && post.images && post.images.length > 0 && (
        <ImageModal
          isOpen={isModalOpen}
          images={post.images.map(image => {
            const isFullUrl = image.startsWith("http://") || image.startsWith("https://");
            return isFullUrl ? image : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${image}`;
          })}
          currentIndex={selectedImageIndex}
          onClose={closeImageModal}
          onPrevious={selectedImageIndex > 0 ? handlePreviousImage : undefined}
          onNext={selectedImageIndex < post.images.length - 1 ? handleNextImage : undefined}
        />
      )}
    </>
  );
};

export default ReplyComponent;
