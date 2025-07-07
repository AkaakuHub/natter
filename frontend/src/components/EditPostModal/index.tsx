"use client";

import React, { useState, useEffect } from "react";
import { Post } from "@/api/types";
import { usePostEdit } from "@/hooks/usePostEdit";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useFormValidation } from "@/hooks/useFormValidation";

import ModalHeader from "./components/ModalHeader";
import EditForm from "./components/EditForm";

interface EditPostModalProps {
  isOpen: boolean;
  post: Post;
  onClose: () => void;
  onEditSuccess?: (updatedPost: Post) => void;
}

const EditPostModal = ({
  isOpen,
  post,
  onClose,
  onEditSuccess,
}: EditPostModalProps) => {
  const [content, setContent] = useState(post.content || "");
  const characterLimit = 280;

  const { isEditing, editPost } = usePostEdit();
  const {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleImageRemove,
    clearImages,
  } = useImageUpload(10);
  const { remainingChars, isValid } = useFormValidation(
    content,
    images.length,
    characterLimit,
  );

  // モーダルが開かれた時に初期値を設定
  useEffect(() => {
    if (isOpen) {
      setContent(post.content || "");
      clearImages();
    }
  }, [isOpen, post.content, clearImages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || content.trim() === (post.content || "").trim()) {
      return;
    }

    const updatedPost = await editPost(post.id, content.trim(), images);
    if (updatedPost) {
      onEditSuccess?.(updatedPost);
      onClose();
    }
  };

  const handleClose = () => {
    setContent(post.content || "");
    clearImages();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mt-16 max-h-[80vh] overflow-y-auto">
        <ModalHeader onClose={handleClose} />

        <EditForm
          content={content}
          onContentChange={setContent}
          imagePreviewUrls={imagePreviewUrls}
          onImageRemove={handleImageRemove}
          onImageAdd={handleImageAdd}
          onSubmit={handleSubmit}
          remainingChars={remainingChars}
          isSubmitting={isEditing}
          isValid={isValid}
          hasChanges={
            content.trim() !== (post.content || "").trim() || images.length > 0
          }
          characterLimit={characterLimit}
        />
      </div>
    </div>
  );
};

export default EditPostModal;
