"use client";

import React, { useState, useEffect } from "react";

import Image from "next/image";

import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { PostsApi } from "@/api";
import { useNavigation } from "@/hooks/useNavigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ImageModal from "@/components/ImageModal";
import ReplyModal from "@/components/ReplyModal";

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
    _count?: {
      replies: number;
    };
    replyTo?: {
      id: number;
      content: string;
      author: {
        id: string;
        name: string;
      };
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
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyCount, setReplyCount] = useState(0);

  // propsが変更されたときに状態を同期
  useEffect(() => {
    setIsLiked(
      currentUserId ? post.liked?.includes(currentUserId) || false : false,
    );
    setLikeCount(post.liked?.length || 0);
    setReplyCount(post._count?.replies || 0);
  }, [post.liked, post._count?.replies, currentUserId]);

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

  const handleReplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (content: string, images: File[]) => {
    if (!currentUser) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("authorId", currentUser.id);
    formData.append("replyToId", post.id.toString());

    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create reply");
    }

    // リプライカウントを増加
    setReplyCount((prev) => prev + 1);
  };

  return (
    <>
      <div className="border-b border-gray-200 py-4 px-4 flex gap-4">
        <button
          onClick={() => navigateToProfile(user?.id)}
          className="flex-shrink-0 self-start"
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
          {post.replyTo && (
            <p className="text-[#71767b] text-sm mt-1">
              返信先:{" "}
              <span
                className="text-[#1d9bf0] hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToPost(post.replyTo!.id);
                }}
              >
                @{post.replyTo.author.name}
              </span>
            </p>
          )}
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
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1 hover:text-blue-500 w-[calc(100% / 3)] justify-center transition-colors"
            >
              <IconMessageCircle size={20} />
              <span>{replyCount}</span>
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

      {/* リプライモーダル */}
      {showReplyModal && (
        <ReplyModal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          replyToPost={{
            id: post.id,
            content: post.content,
            author: {
              name: user.name,
              image: user.image,
            },
          }}
          currentUser={currentUser}
          onReplySubmit={handleReplySubmit}
        />
      )}
    </>
  );
};

export default PostComponent;
