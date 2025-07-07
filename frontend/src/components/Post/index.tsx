"use client";

import React, { useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePostLike } from "@/hooks/usePostLike";
import { usePostReply } from "@/hooks/usePostReply";
import { useImageModal } from "@/hooks/useImageModal";
import { getImageUrl } from "@/utils/postUtils";
import { Post } from "@/api/types";

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
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: () => void;
}

const PostComponent = ({
  user,
  post,
  onPostUpdate,
  onPostDelete,
}: PostComponentProps) => {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const { navigateToPost, navigateToProfile } = useNavigation();
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const { isLiked, likeCount, isLiking, handleLike } = usePostLike(
    currentPost.id,
    currentPost.likes?.map((like) => like.userId) || [],
    currentUserId,
  );

  const {
    replyCount,
    showReplyModal,
    setShowReplyModal,
    handleReplyClick,
    handleReplySubmit,
  } = usePostReply(currentPost.id, currentPost._count?.replies, currentUser);

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
    onPostUpdate?.(updatedPost);
  };

  const handlePostDelete = () => {
    onPostDelete?.();
  };

  return (
    <>
      <article
        className="bg-surface hover:bg-surface-variant transition-colors duration-200 border-b border-border py-6 px-6 cursor-pointer"
        onClick={() => currentPost?.id && navigateToPost(currentPost.id)}
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
            {currentPost.replyTo && (
              <ReplyToIndicator
                replyTo={currentPost.replyTo}
                onReplyToClick={() => navigateToPost(currentPost.replyTo!.id)}
              />
            )}
            <PostContent
              content={currentPost.content || ""}
              images={currentPost.images}
              onImageClick={handleImageClick}
            />
            <PostActions
              isLiked={isLiked}
              likeCount={likeCount}
              isLiking={isLiking}
              replyCount={replyCount}
              onLike={handleLike}
              onReply={handleReplyClick}
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
