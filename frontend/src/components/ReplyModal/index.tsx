"use client";

import React from "react";
import { User } from "@/api";
import { useReplyModal } from "@/hooks/useReplyModal";

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
    author: {
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
  const {
    content,
    setContent,
    imagePreviewUrls,
    handleImageAdd,
    handleImageRemove,
    remainingChars,
    isValid,
    handleSubmit,
    isSubmitting,
  } = useReplyModal();

  if (!isOpen) return null;

  // 認証されていない場合は返信モーダルを閉じる
  if (!currentUser) {
    console.log("❌ ReplyModal: No current user, closing modal");
    onClose();
    return null;
  }

  const onFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, onReplySubmit, onClose);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-overlay p-4">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-lg w-full mt-16 max-h-[80vh] overflow-y-auto border border-border">
        <ModalHeader onClose={onClose} />
        <OriginalPost replyToPost={replyToPost} />
        <ReplyForm
          currentUser={currentUser}
          content={content}
          onContentChange={setContent}
          imagePreviewUrls={imagePreviewUrls}
          onImageRemove={handleImageRemove}
          onImageAdd={handleImageAdd}
          onSubmit={onFormSubmit}
          remainingChars={remainingChars}
          isSubmitting={isSubmitting}
          isValid={isValid}
        />
      </div>
    </div>
  );
};

export default ReplyModal;
