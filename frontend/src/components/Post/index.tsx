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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <article
        className="bg-white hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 py-6 px-6 cursor-pointer"
        onClick={() => post?.id && navigateToPost(post.id)}
      >
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateToProfile(user?.id);
            }}
            className="flex-shrink-0 self-start"
          >
            <Image
              src={user?.image || "no_avatar_image_128x128.png"}
              alt={user?.name || "User"}
              className="w-12 h-12 rounded-full border-2 border-gray-100 hover:border-blue-200 transition-colors duration-200 cursor-pointer"
              width={48}
              height={48}
            />
          </button>
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <button
                  className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile(user?.id);
                  }}
                >
                  {user?.name || "Unknown User"}
                </button>
                <span className="text-sm text-gray-500">
                  @{user?.id || "unknown"}
                </span>
              </div>
              <time className="text-xs text-gray-400 block">
                {formatDate(post.createdAt)}
              </time>
            </div>
            {post.replyTo && (
              <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-200 rounded-r-lg">
                <p className="text-blue-700 text-sm">
                  <span className="font-medium">返信先:</span>{" "}
                  <button
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToPost(post.replyTo!.id);
                    }}
                  >
                    @{post.replyTo.author.name}
                  </button>
                </p>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap mb-4">
                {post.content}
              </p>
            </div>
            {post.images && post.images.length > 0 && (
              <div
                className={`mt-4 gap-3 ${
                  post.images.length === 1
                    ? "flex justify-center"
                    : post.images.length === 2
                      ? "grid grid-cols-2"
                      : post.images.length === 3
                        ? "grid grid-cols-2 grid-rows-2"
                        : "grid grid-cols-2"
                }`}
              >
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
                        handleImageClick(index);
                      }}
                      className={`relative focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 ${
                        post.images?.length === 1
                          ? "max-w-lg mx-auto"
                          : post.images?.length === 3 && index === 0
                            ? "row-span-2"
                            : ""
                      }`}
                    >
                      <Image
                        src={imageSrc}
                        alt="Post Image"
                        className={`rounded-2xl ${
                          post.images?.length === 1
                            ? "w-full h-auto max-h-96 object-cover"
                            : post.images?.length === 3 && index === 0
                              ? "w-full h-full object-cover"
                              : "w-full h-auto aspect-square object-cover"
                        }`}
                        width={200}
                        height={200}
                      />
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(e);
                  }}
                  disabled={isLiking || !currentUserId}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 ${
                    isLiked
                      ? "text-red-500 bg-red-50 hover:bg-red-100"
                      : "text-gray-600 hover:text-red-500 hover:bg-red-50"
                  } ${isLiking || !currentUserId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <IconHeart
                    size={18}
                    fill={isLiked ? "currentColor" : "none"}
                    className="transition-colors duration-200"
                  />
                  <span className="font-medium text-sm">{likeCount}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReplyClick(e);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200"
                >
                  <IconMessageCircle size={18} />
                  <span className="font-medium text-sm">{replyCount}</span>
                </button>

                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors duration-200"
                >
                  <IconShare size={18} />
                  <span className="font-medium text-sm">共有</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* 画像モーダル */}
      {isModalOpen && post.images && post.images.length > 0 && (
        <ImageModal
          isOpen={isModalOpen}
          images={post.images.map((image) => {
            const isFullUrl =
              image.startsWith("http://") || image.startsWith("https://");
            return isFullUrl
              ? image
              : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${image}`;
          })}
          currentIndex={selectedImageIndex}
          onClose={closeImageModal}
          onPrevious={selectedImageIndex > 0 ? handlePreviousImage : undefined}
          onNext={
            selectedImageIndex < post.images.length - 1
              ? handleNextImage
              : undefined
          }
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
