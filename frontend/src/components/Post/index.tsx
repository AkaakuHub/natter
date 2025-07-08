"use client";

import React, { useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { usePostActions } from "@/hooks/usePostActions";
import { useImageModal } from "@/hooks/useImageModal";
import { getImageUrl } from "@/utils/postUtils";
import { usePostShare } from "@/hooks/usePostShare";
import { useToast } from "@/hooks/useToast";
import { Post, PostsApi } from "@/api";

import ImageModal from "@/components/ImageModal";
import ReplyModal from "@/components/ReplyModal";

import UserAvatar from "./components/UserAvatar";
import PostHeader from "./components/PostHeader";
import ReplyToIndicator from "./components/ReplyToIndicator";
import PostContent from "./components/PostContent";
import PostActions from "./components/PostActions";

interface PostComponentProps {
  user: {
    id: string;
    name: string;
    image: string;
  };
  post: Post;
  currentUser?: {
    id: string;
    name: string;
    image?: string;
    twitterId: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  onPostUpdate?: () => void;
  onPostDelete?: () => void;
}

const PostComponent = ({
  user,
  post,
  currentUser,
  onPostUpdate,
  onPostDelete,
}: PostComponentProps) => {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const { navigateToPost, navigateToProfile } = useNavigation();
  const currentUserId = currentUser?.id;
  const { sharePost } = usePostShare();
  const { showToast } = useToast();

  // デバッグ: currentUserの状態を確認
  console.log("🔍 PostComponent - currentUser:", currentUser);
  console.log("🔍 PostComponent - currentUserId:", currentUserId);

  const handlePostUpdateCallback = () => {
    if (onPostUpdate) {
      onPostUpdate();
    }
  };

  const {
    isLiked,
    likeCount,
    isLiking,
    handleLike,
    showReplyModal,
    setShowReplyModal,
    handleReplyClick,
  } = usePostActions(currentPost, currentUserId, handlePostUpdateCallback);

  const {
    isModalOpen,
    selectedImageIndex,
    handleImageClick,
    closeImageModal,
    handlePreviousImage,
    handleNextImage,
  } = useImageModal();

  const canInteract = !!currentUserId;

  const handlePostUpdate = (updatedPost: Post) => {
    setCurrentPost(updatedPost);
    onPostUpdate?.();
  };

  const handlePostDelete = () => {
    onPostDelete?.();
  };

  const handleReplySubmit = async (content: string, images: File[]) => {
    if (!currentUserId || !currentPost) {
      console.error("❌ Cannot reply: missing user or post");
      return;
    }

    try {
      console.log("🚀 Submitting reply:", {
        content,
        postId: currentPost.id,
        authorId: currentUserId,
      });

      const formData = new FormData();
      formData.append("content", content);
      formData.append("authorId", currentUserId);
      formData.append("replyToId", currentPost.id.toString());

      // 画像を追加
      images.forEach((image) => {
        formData.append("images", image);
      });

      const newReply = await PostsApi.createPostWithImages(formData);
      console.log("✅ Reply submitted successfully:", newReply);

      // 成功トースト通知を表示（クリックで新しい返信ポストに遷移）
      showToast("返信を投稿しました", "success", 3000, () => {
        navigateToPost(newReply.id);
      });

      // リプライ後にタイムラインを更新
      if (onPostUpdate) {
        onPostUpdate();
      }
      setShowReplyModal(false);
    } catch (error) {
      console.error("❌ Failed to submit reply:", error);
      showToast("返信の送信に失敗しました", "error");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentPost) return;

    const authorName = user?.name || "Unknown User";
    const postContent = currentPost.content || "";

    await sharePost(currentPost.id.toString(), postContent, authorName);
  };

  return (
    <>
      <article
        className="bg-surface hover:bg-surface-elevated transition-colors duration-200 border-b border-border py-6 px-6 cursor-pointer"
        onClick={(e) => {
          // クリックされた要素を確認
          const target = e.target as HTMLElement;

          // ボタンやリンクなどのインタラクティブ要素の場合は無視
          if (target.closest('button, a, [role="button"]')) {
            return;
          }

          // テキスト選択中の場合はクリックイベントを無視
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            return;
          }

          if (currentPost?.id) {
            navigateToPost(currentPost.id);
          }
        }}
      >
        <div className="flex gap-4">
          <UserAvatar
            user={user}
            onUserClick={() => navigateToProfile(user?.id)}
          />
          <div className="flex-1 min-w-0">
            <PostHeader
              user={user}
              post={currentPost}
              createdAt={currentPost.createdAt}
              onUserClick={() => navigateToProfile(user?.id)}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
            />
            {currentPost.replyTo ? (
              currentPost.replyTo.deletedAt ? (
                <div className="mb-3 p-3 bg-error-bg border-l-4 border-error/30 rounded-r-lg">
                  <div className="flex items-center gap-2 text-error">
                    <div className="w-4 h-4 bg-error rounded-full"></div>
                    <span className="text-sm font-medium">
                      元の投稿は削除されました
                    </span>
                  </div>
                </div>
              ) : (
                <ReplyToIndicator
                  replyTo={currentPost.replyTo}
                  onReplyToClick={() => navigateToPost(currentPost.replyTo!.id)}
                />
              )
            ) : currentPost.replyToId ? (
              <div className="mb-3 p-3 bg-error-bg border-l-4 border-error/30 rounded-r-lg">
                <div className="flex items-center gap-2 text-error">
                  <div className="w-4 h-4 bg-error rounded-full"></div>
                  <span className="text-sm font-medium">
                    元の投稿は削除されました
                  </span>
                </div>
              </div>
            ) : null}
            <PostContent
              content={currentPost.content || ""}
              images={currentPost.images}
              onImageClick={handleImageClick}
            />
            <PostActions
              isLiked={isLiked}
              likeCount={likeCount}
              isLiking={isLiking}
              replyCount={currentPost._count?.replies || 0}
              onLike={handleLike}
              onReply={handleReplyClick}
              onShare={handleShare}
              canInteract={canInteract}
            />
          </div>
        </div>
      </article>

      {isModalOpen && currentPost.images && currentPost.images.length > 0 && (
        <ImageModal
          isOpen={isModalOpen}
          images={currentPost.images.map((image) => getImageUrl(image))}
          currentIndex={selectedImageIndex}
          onClose={closeImageModal}
          onPrevious={selectedImageIndex > 0 ? handlePreviousImage : undefined}
          onNext={
            selectedImageIndex < currentPost.images.length - 1
              ? handleNextImage
              : undefined
          }
        />
      )}

      {showReplyModal && (
        <ReplyModal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          replyToPost={{
            id: currentPost.id,
            content: currentPost.content || "",
            images: currentPost.images || [],
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
