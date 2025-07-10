"use client";

import React from "react";
import { User, Post } from "@/api";
import { ApiClient } from "@/api/client";
import { useNavigation } from "@/hooks/useNavigation";
import { useEffect } from "react";
import { useDetailedPost } from "@/hooks/useDetailedPost";
import { usePostActions } from "@/hooks/usePostActions";
import { useImageModal } from "@/hooks/useImageModal";
import { useToast } from "@/hooks/useToast";
import { usePostShare } from "@/hooks/usePostShare";

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
  const { goBack, navigateToProfile, navigateToPost, navigateToTimeline } =
    useNavigation();
  const { showToast } = useToast();
  const { sharePost } = usePostShare();

  const { post, loading, error, replies, setReplies, refreshPost } =
    useDetailedPost(postId, currentUser?.id);

  // 削除された投稿の場合のリダイレクト処理
  useEffect(() => {
    if (post && post.deletedAt) {
      showToast("この投稿は削除されています", "error", 3000);
      navigateToTimeline();
    }
  }, [post, showToast, navigateToTimeline]);

  const handlePostUpdate = () => {
    // usePostActionsで楽観的更新済みのため、再取得は不要
    // refreshPost();
  };

  const {
    isLiked,
    likeCount,
    isLiking,
    handleLike,
    showReplyModal,
    setShowReplyModal,
    handleReplyClick,
  } = usePostActions(post, currentUser?.id, handlePostUpdate);
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

      const newReply = await ApiClient.postFormData<Post>("/posts", formData);
      setReplies((prev) => [...prev, newReply]);

      showToast("リプライをしました。", "success", 3000, () => {
        navigateToPost(newReply.id);
      });
    } catch (error) {
      console.error("Failed to create reply:", error);
      throw new Error("Failed to create reply");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post) return;

    const authorName = post.author?.name || "Unknown User";
    const postContent = post.content || "";

    await sharePost(post.id.toString(), postContent, authorName);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !post) {
    return (
      <ErrorState
        error={error}
        onBack={goBack}
        canInteract={!!currentUser?.id}
      />
    );
  }

  const user = post.author;

  if (!user) {
    return (
      <ErrorState
        error="投稿者の情報が見つかりません"
        onBack={goBack}
        canInteract={!!currentUser?.id}
      />
    );
  }
  const canInteract = !!currentUser?.id;

  return (
    <div className="bg-gradient-to-br from-surface-variant to-surface-variant/60 min-h-full">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {canInteract && <BackButton onBack={goBack} />}

        <div className="bg-surface/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-glow border border-border/60 transition-all duration-300">
          {post.replyTo ? (
            post.replyTo.deletedAt ? (
              <div className="p-6 bg-surface-variant/50 border-b border-border/60">
                <div className="flex items-center gap-2 text-text-muted">
                  <div className="w-4 h-4 bg-error rounded-full"></div>
                  <span className="text-sm">元の投稿は削除されました</span>
                </div>
              </div>
            ) : (
              <ParentPostCard
                parentPost={{
                  id: post.replyTo.id,
                  content: post.replyTo.content,
                  images: post.replyTo.images || [],
                  author: {
                    name: post.replyTo.author?.name,
                    image: post.replyTo.author?.image,
                  },
                }}
                onParentPostClick={() => navigateToPost(post.replyTo!.id)}
              />
            )
          ) : post.replyToId ? (
            <div className="p-6 bg-surface-variant/50 border-b border-border/60">
              <div className="flex items-center gap-2 text-text-muted">
                <div className="w-4 h-4 bg-error rounded-full"></div>
                <span className="text-sm">元の投稿は削除されました</span>
              </div>
            </div>
          ) : null}

          <PostHeader
            user={user}
            createdAt={post.createdAt}
            onUserClick={() => navigateToProfile(user?.id)}
            post={post}
            onPostUpdate={() => {
              // 投稿が更新された場合は再取得
              refreshPost();
            }}
            onPostDelete={() => {
              // 削除された場合は戻る
              goBack();
            }}
          />

          <PostContent
            content={post.content || ""}
            images={post.images}
            url={post.url}
            character={post.character}
            onImageClick={handleImageClick}
          />

          <PostActions
            isLiked={isLiked}
            likeCount={likeCount}
            isLiking={isLiking}
            repliesCount={replies.length}
            onLike={handleLike}
            onReply={handleReplyClick}
            onShare={handleShare}
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

      {showReplyModal && post && currentUser && (
        <ReplyModal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          replyToPost={{
            id: post.id,
            content: post.content || "",
            images: post.images || [],
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
