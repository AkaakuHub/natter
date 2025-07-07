"use client";

import React from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePostLike } from "@/hooks/usePostLike";
import { usePostReply } from "@/hooks/usePostReply";
import { useImageModal } from "@/hooks/useImageModal";
import { getImageUrl } from "@/utils/postUtils";

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

const PostComponent = ({ user, post }: PostComponentProps) => {
  const { navigateToPost, navigateToProfile } = useNavigation();
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;
  
  const { isLiked, likeCount, isLiking, handleLike } = usePostLike(
    post.id,
    post.liked,
    currentUserId,
  );
  
  const {
    replyCount,
    showReplyModal,
    setShowReplyModal,
    handleReplyClick,
    handleReplySubmit,
  } = usePostReply(post.id, post._count?.replies, currentUser);
  
  const {
    isModalOpen,
    selectedImageIndex,
    handleImageClick,
    closeImageModal,
    handlePreviousImage,
    handleNextImage,
  } = useImageModal();
  
  const canInteract = !!currentUserId;

  return (
    <>
      <article
        className="bg-white hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 py-6 px-6 cursor-pointer"
        onClick={() => post?.id && navigateToPost(post.id)}
      >
        <div className="flex gap-4">
          <UserAvatar
            user={user}
            onUserClick={() => navigateToProfile(user?.id)}
          />
          <div className="flex-1 min-w-0">
            <PostHeader
              user={user}
              createdAt={post.createdAt}
              onUserClick={() => navigateToProfile(user?.id)}
            />
            {post.replyTo && (
              <ReplyToIndicator
                replyTo={post.replyTo}
                onReplyToClick={() => navigateToPost(post.replyTo!.id)}
              />
            )}
            <PostContent
              content={post.content}
              images={post.images}
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

      {isModalOpen && post.images && post.images.length > 0 && (
        <ImageModal
          isOpen={isModalOpen}
          images={post.images.map((image) => getImageUrl(image))}
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
