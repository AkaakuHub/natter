"use client";

import React, { useState } from "react";
import { IconX } from "@tabler/icons-react";
import { User, Character } from "@/api";
import { useImageUpload } from "@/hooks/useImageUpload";
import { usePostSubmit } from "@/hooks/usePostSubmit";
import { useFormValidation } from "@/hooks/useFormValidation";

import UserAvatar from "../CreatePost/components/UserAvatar";
import PostTextArea from "../CreatePost/components/PostTextArea";
import ImagePreview from "../CreatePost/components/ImagePreview";
import ErrorMessage from "../CreatePost/components/ErrorMessage";
import PostActions from "../CreatePost/components/PostActions";
import CharacterTagSelector from "../CharacterTagSelector";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  currentUser?: User | null;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  currentUser,
}) => {
  const [content, setContent] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const characterLimit = 280;

  const {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleImageRemove,
    clearImages,
  } = useImageUpload(10);
  const {
    isSubmitting,
    error,
    handleSubmit: submitPost,
  } = usePostSubmit(currentUser, onPostCreated);
  const { remainingChars, isValid } = useFormValidation(
    content,
    images.length,
    characterLimit,
    !!selectedCharacter,
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    await submitPost(
      content,
      images,
      undefined,
      selectedCharacter?.id || undefined,
    );

    // 成功時にフォームをクリアしてモーダルを閉じる
    if (!error) {
      setContent("");
      setSelectedCharacter(null);
      clearImages();
      onClose();
    }
  };

  const handleClose = () => {
    setContent("");
    setSelectedCharacter(null);
    clearImages();
    onClose();
  };

  if (!isOpen) return null;

  // 認証されていない場合はログインを促す
  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
        <div className="bg-surface rounded-lg max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-bold text-text mb-4">
            ログインが必要です
          </h2>
          <p className="text-text-secondary mb-6">
            投稿するにはログインしてください。
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-border rounded-lg text-text hover:bg-surface-hover"
            >
              閉じる
            </button>
            <a
              href="/login"
              className="px-4 py-2 bg-interactive text-text-inverse rounded-lg hover:bg-interactive-hover"
            >
              ログイン
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-overlay flex items-start justify-center z-50 p-3 sm:p-4">
      <div className="bg-surface rounded-lg max-w-lg w-full mt-2 sm:mt-16 border border-border relative max-h-[95vh] sm:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg sm:text-lg font-semibold text-text">
            新しい投稿
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-surface-hover active:bg-surface-hover transition-colors touch-manipulation"
            disabled={isSubmitting}
          >
            <IconX size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-4">
            <div className="flex gap-3 sm:gap-4">
              <div className="hidden sm:block flex-shrink-0">
                <UserAvatar user={currentUser} />
              </div>

              <div className="flex-1 min-w-0">
                <PostTextArea
                  value={content}
                  onChange={setContent}
                  characterLimit={characterLimit}
                  disabled={isSubmitting}
                  onSubmit={() => handleSubmit()}
                  placeholder="今何してる？"
                  autoFocus={true}
                />

                <div className="mt-4 sm:mt-4 relative z-10">
                  <CharacterTagSelector
                    selectedCharacter={selectedCharacter}
                    onCharacterChange={setSelectedCharacter}
                  />
                </div>

                <ImagePreview
                  imageUrls={imagePreviewUrls}
                  onRemove={handleImageRemove}
                />

                <ErrorMessage error={error} />

                <PostActions
                  onImageAdd={handleImageAdd}
                  onSubmit={() => handleSubmit()}
                  remainingChars={remainingChars}
                  isSubmitting={isSubmitting}
                  isValid={isValid}
                  imageCount={images.length}
                  maxImages={10}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
