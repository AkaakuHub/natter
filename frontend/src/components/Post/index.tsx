"use client";

import React, { useState, useEffect } from "react";

import Image from "next/image";

import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { PostsApi } from "@/api";
import { useNavigation } from "@/hooks/useNavigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ImageModal from "@/components/ImageModal";

interface PostComponentProps {
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

const PostComponent = ({ user, post }: PostComponentProps) => {
  const { navigateToPost, navigateToProfile } = useNavigation();
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  // propsが変更されたときに状態を同期
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

  const handleImageClick = (imageSrc: string, imageAlt: string) => {
    setSelectedImage({ src: imageSrc, alt: imageAlt });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="border-b border-gray-200 py-4 px-4 flex gap-4">
        <button
          onClick={() => navigateToProfile(user?.id)}
          className="flex-shrink-0"
        >
          <Image
            src={user?.image || "no_avatar_image_128x128.png"}
            alt={user?.name || "User"}
            className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
            width={48}
            height={48}
          />
        </button>
        <div
          className="flex-1"
          onClick={() => post?.id && navigateToPost(post.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <button
                className="hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToProfile(user?.id);
                }}
              >
                <span className="font-bold">
                  {user?.name || "Unknown User"}
                </span>
              </button>
              <span className="text-sm text-gray-500 ml-2">
                @{user?.id || "unknown"}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(post.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-gray-800">{post.content}</p>
          {post.images && post.images.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {post.images.map((image, index) => {
                // 完全URLか相対パスかを判定
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
                      handleImageClick(imageSrc, `Post Image ${index + 1}`);
                    }}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
                  >
                    <Image
                      src={imageSrc}
                      alt="Post Image"
                      className="w-full h-auto rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                      width={200}
                      height={200}
                    />
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-8 mt-2 text-gray-500">
            <button
              onClick={handleLike}
              disabled={isLiking || !currentUserId}
              className={`flex items-center gap-1 hover:text-red-500 w-[calc(100% / 3)] justify-center transition-colors ${
                isLiked ? "text-red-500" : ""
              } ${isLiking || !currentUserId ? "opacity-50" : ""}`}
            >
              <IconHeart size={20} fill={isLiked ? "currentColor" : "none"} />
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

      {/* 画像モーダル */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          imageSrc={selectedImage.src}
          imageAlt={selectedImage.alt}
          onClose={closeImageModal}
        />
      )}
    </>
  );
};

export default PostComponent;
