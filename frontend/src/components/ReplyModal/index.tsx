"use client";

import React from "react";
import { User } from "@/api";
import { useReplyModal } from "@/hooks/useReplyModal";
import { useScrollLock } from "@/hooks/useScrollLock";
import { ui } from "@/styles/ui";

import ModalHeader from "./components/ModalHeader";
import OriginalPost from "./components/OriginalPost";
import ReplyForm from "./components/ReplyForm";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyToPost: {
    id: number;
    content: string;
    images?: string[];
    imagesPublic?: boolean;
    authorId?: string;
    author: {
      id?: string;
      name: string;
      image?: string;
    };
  };
  currentUser?: User | null;
  onReplySubmit: (content: string, images: File[]) => Promise<void>;
}

const ReplyModal = ({
  isOpen,
  onClose,
  replyToPost,
  currentUser,
  onReplySubmit,
}: ReplyModalProps) => {
  useScrollLock(isOpen);

  const {
    content,
    setContent,
    imagePreviewUrls,
    handleImageAdd,
    handleFilesAdd,
    handleImageRemove,
    remainingChars,
    isValid,
    effectiveLength,
    actualLength,
    handleSubmit,
    isSubmitting,
  } = useReplyModal();

  if (!isOpen) return null;

  // 認証されていない場合はログインメッセージを表示
  if (!currentUser) {
    console.log("❌ ReplyModal: No current user, showing login message");
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-overlay p-4">
        <div className={`${ui.surface.modal} max-w-lg w-full mt-16 p-6`}>
          <ModalHeader onClose={onClose} />
          <div className="text-center py-8">
            <p className="text-text-muted">返信するにはログインが必要です</p>
          </div>
        </div>
      </div>
    );
  }

  const onFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, onReplySubmit, onClose);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-overlay p-4">
      <div
        className={`${ui.surface.modal} max-w-lg w-full mt-16 max-h-[80vh] overflow-y-auto`}
      >
        <ModalHeader onClose={onClose} />
        <OriginalPost
          replyToPost={replyToPost}
          currentUserId={currentUser.id}
        />
        <ReplyForm
          currentUser={currentUser}
          content={content}
          onContentChange={setContent}
          imagePreviewUrls={imagePreviewUrls}
          onImageRemove={handleImageRemove}
          onImageAdd={handleImageAdd}
          onFilesAdd={handleFilesAdd}
          onSubmit={onFormSubmit}
          remainingChars={remainingChars}
          isSubmitting={isSubmitting}
          isValid={isValid}
          effectiveLength={effectiveLength}
          actualLength={actualLength}
          maxImages={maxImages}
        />
      </div>
    </div>
  );
};

export default ReplyModal;
const maxImages = 10;
