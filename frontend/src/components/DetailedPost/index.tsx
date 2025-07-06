"use client";

import React, { useState, useEffect } from "react";

import Image from "next/image";
import {
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconArrowLeft,
} from "@tabler/icons-react";
import { PostsApi, Post, User } from "@/api";
import { useNavigation } from "@/hooks/useNavigation";
import ImageModal from "@/components/ImageModal";
import ReplyModal from "@/components/ReplyModal";
import PostComponent from "@/components/Post";
import { useToast } from "@/hooks/useToast";

interface DetailedPostComponentProps {
  postId: string;
  currentUser?: User | null;
}

const DetailedPostComponent = ({
  postId,
  currentUser,
}: DetailedPostComponentProps) => {
  const { goBack, navigateToProfile, navigateToPost } = useNavigation();
  const { showToast } = useToast();
  const currentUserId = currentUser?.id;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replies, setReplies] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      // postIdの妥当性をチェック
      if (!postId || postId === "undefined" || postId === "null") {
        setError("投稿IDが無効です");
        setLoading(false);
        return;
      }

      const numericPostId = parseInt(postId);
      if (isNaN(numericPostId)) {
        setError("投稿IDが無効です");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [fetchedPost, fetchedReplies] = await Promise.all([
          PostsApi.getPostById(numericPostId),
          PostsApi.getReplies(numericPostId),
        ]);
        setPost(fetchedPost);
        setReplies(fetchedReplies);
        setIsLiked(
          currentUserId
            ? fetchedPost.likes?.some(
                (like) => like.userId === currentUserId,
              ) || false
            : false,
        );
        setLikeCount(fetchedPost.likes?.length || 0);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("投稿の読み込みに失敗しました");
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
      setLikeCount((prev) => (response.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to like post:", error);
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

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImageIndex(-1);
  };

  const handlePreviousImage = () => {
    if (post?.images && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (post?.images && selectedImageIndex < post.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleReplyClick = () => {
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (content: string, images: File[]) => {
    if (!currentUser || !post) return;

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

    // リプライリストを更新
    const newReply = await response.json();
    setReplies((prev) => [...prev, newReply]);

    // トースト通知を表示（クリックで作成したリプライへ遷移）
    showToast("リプライをしました。", "success", 3000, () => {
      navigateToPost(newReply.id);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="text-red-500 text-lg font-medium">
              {error || "ポストが見つかりませんでした"}
            </div>
            <button
              onClick={goBack}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = post.author;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-all duration-300 group p-2 rounded-full hover:bg-blue-50"
        >
          <IconArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">戻る</span>
        </button>

        {/* Main post card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-glow border border-gray-100/60 overflow-hidden transition-all duration-300">
          {/* Parent post section */}
          {post.replyTo && (
            <div className="p-6 bg-gray-50/50 border-b border-gray-100/60">
              <button
                onClick={() => navigateToPost(post.replyTo!.id)}
                className="w-full text-left hover:bg-gray-100 transition-all duration-300 p-4 rounded-2xl hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={
                      post.replyTo.author?.image ||
                      "/no_avatar_image_128x128.png"
                    }
                    alt={`${post.replyTo.author?.name}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-gray-200 hover:ring-blue-200 transition-all duration-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">返信先</p>
                    <p className="font-semibold text-gray-900">
                      {post.replyTo.author?.name}
                    </p>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                      {post.replyTo.content}
                    </p>
                  </div>
                  <IconArrowLeft
                    size={20}
                    className="text-gray-400 rotate-180"
                  />
                </div>
              </button>
            </div>
          )}

          {/* User header */}
          <div className="p-6 border-b border-gray-100/60">
            <div className="flex items-start space-x-4">
              <button
                onClick={() => navigateToProfile(user?.id)}
                className="flex-shrink-0"
              >
                <Image
                  src={user?.image || "/no_avatar_image_128x128.png"}
                  alt={`${user?.name}'s avatar`}
                  width={56}
                  height={56}
                  className="rounded-full ring-2 ring-gray-200 hover:ring-blue-200 transition-all duration-300 hover:scale-105"
                />
              </button>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => navigateToProfile(user?.id)}
                  className="hover:underline block mb-1"
                >
                  <h1 className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors duration-300">
                    {user?.name}
                  </h1>
                </button>
                <p className="text-gray-500 text-sm mb-2">@{user?.id}</p>
                <time className="text-xs text-gray-400">
                  {formatDate(post.createdAt)}
                </time>
              </div>
            </div>
          </div>

          {/* Post content */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {post.content}
              </p>
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div
                className={`mt-6 ${post.images.length === 1 ? "flex justify-center" : "grid grid-cols-2 gap-4"}`}
              >
                {post.images.map((image, idx) => {
                  // 完全URLか相対パスかを判定
                  const isFullUrl =
                    image.startsWith("http://") || image.startsWith("https://");
                  const imageSrc = isFullUrl
                    ? image
                    : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${image}`;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleImageClick(idx)}
                      className="relative group overflow-hidden rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.02]"
                    >
                      <Image
                        src={imageSrc}
                        alt={`Post image ${idx + 1}`}
                        width={512}
                        height={512}
                        className="w-full h-auto object-cover transition-all duration-300 group-hover:scale-105 cursor-pointer rounded-3xl"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Timestamp */}
          </div>

          {/* Action buttons */}
          <div className="px-6 py-4 border-t border-gray-100/60 bg-gray-50/30">
            <div className="flex items-center justify-around">
              <button
                onClick={handleLike}
                disabled={isLiking || !currentUserId}
                className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
                  isLiked
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-gray-600 hover:text-red-500 hover:bg-red-50"
                } ${isLiking || !currentUserId ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <IconHeart
                  size={20}
                  fill={isLiked ? "currentColor" : "none"}
                  className={isLiked ? "animate-pulse" : ""}
                />
                <span className="font-medium">{likeCount}</span>
              </button>

              <button
                onClick={handleReplyClick}
                className="flex items-center gap-2 px-4 py-3 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                <IconMessageCircle size={20} />
                <span className="font-medium">{replies.length}</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-3 rounded-full text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all duration-300 hover:scale-105">
                <IconShare size={20} />
                <span className="font-medium">シェア</span>
              </button>
            </div>
          </div>
        </div>

        {/* リプライセクション */}
        {replies.length > 0 && (
          <div className="border-t border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                リプライ ({replies.length})
              </h3>
              <div className="space-y-4">
                {replies.map((reply) => {
                  if (!reply.author) return null;

                  const transformedUser = {
                    id: reply.author.id,
                    name: reply.author.name,
                    image: reply.author.image || "/no_avatar_image_128x128.png",
                  };

                  const transformedPost = {
                    id: reply.id,
                    userId: reply.authorId || "",
                    content: reply.content || "",
                    images: reply.images || [],
                    createdAt: reply.createdAt,
                    liked: reply.likes?.map((like) => like.userId) || [],
                    _count: reply._count,
                    replyTo: reply.replyTo
                      ? {
                          id: reply.replyTo.id,
                          content: reply.replyTo.content || "",
                          author: {
                            id: reply.replyTo.author?.id || "",
                            name: reply.replyTo.author?.name || "",
                          },
                        }
                      : undefined,
                  };

                  return (
                    <div
                      key={reply.id}
                      className="border border-gray-100 rounded-lg"
                    >
                      <PostComponent
                        user={transformedUser}
                        post={transformedPost}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 画像モーダル */}
      {isModalOpen && post?.images && post.images.length > 0 && (
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
      {showReplyModal && post && (
        <ReplyModal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          replyToPost={{
            id: post.id,
            content: post.content || "",
            author: {
              name: post.author?.name || "Unknown User",
              image: post.author?.image,
            },
          }}
          currentUser={currentUser}
          onReplySubmit={handleReplySubmit}
        />
      )}
    </div>
  );
};

export default DetailedPostComponent;
