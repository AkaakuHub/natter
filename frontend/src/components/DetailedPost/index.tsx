"use client";

import React from "react";
import { User } from "@/api";
import { ApiClient } from "@/api/client";
import { useNavigation } from "@/hooks/useNavigation";
import { useDetailedPost } from "@/hooks/useDetailedPost";
import { usePostActions } from "@/hooks/usePostActions";
import { useImageModal } from "@/hooks/useImageModal";
import { useToast } from "@/hooks/useToast";

import BackButton from "./components/BackButton";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import PostHeader from "./components/PostHeader";
import PostContent from "./components/PostContent";
import PostActions from "./components/PostActions";
import ParentPostCard from "./components/ParentPostCard";
import RepliesList from "./components/RepliesList";

import ImageModal from "@/components/ImageModal";
import ReplyModal from "@/components/ReplyModal";

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

  const { post, loading, error, replies, setReplies } = useDetailedPost(
    postId,
    currentUser?.id,
  );
  const {
    isLiked,
    likeCount,
    isLiking,
    handleLike,
    showReplyModal,
    setShowReplyModal,
    handleReplyClick,
  } = usePostActions(post, currentUser?.id);
  const {
    isModalOpen,
    selectedImageIndex,
    handleImageClick,
    closeImageModal,
    handlePreviousImage,
    handleNextImage,
  } = useImageModal();

  const handleReplySubmit = async (content: string, images: File[]) => {
    if (!currentUser || !post) return;

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("replyToId", post.id.toString());

      images.forEach((file) => {
        formData.append("images", file);
      });

      const newReply = await ApiClient.postFormData("/posts", formData);
      setReplies((prev) => [...prev, newReply]);

      showToast("リプライをしました。", "success", 3000, () => {
        navigateToPost(newReply.id);
      });
    } catch (error) {
      console.error("Failed to create reply:", error);
      throw new Error("Failed to create reply");
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !post) {
    return <ErrorState error={error} onBack={goBack} />;
  }

  const user = post.author;

  if (!user) {
    return <ErrorState message="投稿者の情報が見つかりません" />;
  }
  const canInteract = !!currentUser?.id;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton onBack={goBack} />

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-glow border border-gray-100/60 overflow-hidden transition-all duration-300">
          {post.replyTo && (
            <ParentPostCard
              parentPost={{
                id: post.replyTo.id,
                content: post.replyTo.content,
                author: {
                  name: post.replyTo.author?.name,
                  image: post.replyTo.author?.image,
                },
              }}
              onParentPostClick={() => navigateToPost(post.replyTo!.id)}
            />
          )}

          <PostHeader
            user={user}
            createdAt={post.createdAt}
            onUserClick={() => navigateToProfile(user?.id)}
          />

          <PostContent
            content={post.content || ""}
            images={post.images}
            onImageClick={handleImageClick}
          />

          <PostActions
            isLiked={isLiked}
            likeCount={likeCount}
            isLiking={isLiking}
            repliesCount={replies.length}
            onLike={handleLike}
            onReply={handleReplyClick}
            canInteract={canInteract}
          />
        </div>

        <RepliesList replies={replies} />
      </div>

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
