"use client";

import React, { useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { User, Character } from "@/api";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useClipboardImagePaste } from "@/hooks/useClipboardImagePaste";
import { usePostSubmit } from "@/hooks/usePostSubmit";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useSPANavigation } from "@/core/spa";

import UserAvatar from "../CreatePost/components/UserAvatar";
import PostTextArea from "../CreatePost/components/PostTextArea";
import ImagePreview from "../CreatePost/components/ImagePreview";
import ImageDropZone from "../CreatePost/components/ImageDropZone";
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
  useScrollLock(isOpen);
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [imagesPublic, setImagesPublic] = useState(false); // デフォルト非公開
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const characterLimit = 280;
  const { navigateToLogin } = useSPANavigation();
  const formRef = useRef<HTMLFormElement>(null);

  const maxImages = 10;

  const {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleFilesAdd,
    handleImageRemove,
    clearImages,
  } = useImageUpload(maxImages);
  const {
    isSubmitting,
    error,
    handleSubmit: submitPost,
  } = usePostSubmit(currentUser, onPostCreated);
  const { remainingChars, isValid, effectiveLength, actualLength } =
    useFormValidation(
      content,
      images.length,
      characterLimit,
      !!selectedCharacter,
    );

  useClipboardImagePaste({
    enabled: isOpen && images.length < maxImages && !isSubmitting,
    onPasteImages: handleFilesAdd,
    containerRef: formRef,
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    await submitPost(
      content,
      images,
      url,
      imagesPublic,
      undefined,
      selectedCharacter?.id || undefined,
    );

    // 成功時にフォームをクリアしてモーダルを閉じる
    if (!error) {
      setContent("");
      setUrl("");
      setImagesPublic(false);
      setSelectedCharacter(null);
      clearImages();
      onClose();
    }
  };

  // 入力内容があるかどうかをチェック
  const hasContent = () => {
    return (
      content.trim() !== "" ||
      url.trim() !== "" ||
      images.length > 0 ||
      selectedCharacter !== null
    );
  };

  const handleClose = () => {
    if (hasContent()) {
      setShowDiscardDialog(true);
    } else {
      clearFormAndClose();
    }
  };

  const clearFormAndClose = () => {
    setContent("");
    setUrl("");
    setImagesPublic(false);
    setSelectedCharacter(null);
    clearImages();
    setShowDiscardDialog(false);
    onClose();
  };

  const handleDiscardConfirm = () => {
    clearFormAndClose();
  };

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false);
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
            <button
              onClick={() => navigateToLogin()}
              className="px-4 py-2 bg-interactive text-text-inverse rounded-lg hover:bg-interactive-hover"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-overlay flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto">
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
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-4 sm:p-4"
          >
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

                <div className="mt-4 sm:mt-4 relative z-50">
                  <CharacterTagSelector
                    selectedCharacter={selectedCharacter}
                    onCharacterChange={setSelectedCharacter}
                  />
                </div>

                {/* URL入力欄 */}
                <div className="mt-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const value = e.target.value;
                      // URL長さ制限チェック
                      if (value.length <= 500) {
                        setUrl(value);
                      }
                    }}
                    placeholder="URL（他の人には見えません）"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-interactive focus:border-transparent"
                    disabled={isSubmitting}
                    maxLength={500}
                  />
                  <div className="mt-1 text-xs text-text-muted">
                    {url.length}/500文字
                  </div>
                </div>

                <ImagePreview
                  imageUrls={imagePreviewUrls}
                  onRemove={handleImageRemove}
                />
                <ImageDropZone
                  onFilesAdd={handleFilesAdd}
                  onRequestFileDialog={handleImageAdd}
                  disabled={isSubmitting}
                  canAddMore={images.length < maxImages}
                  maxImages={maxImages}
                />

                {/* 画像公開設定（画像がある場合のみ表示） */}
                {images.length > 0 && (
                  <div className="mt-3 p-3 bg-surface-variant rounded-lg border border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imagesPublic}
                        onChange={(e) => setImagesPublic(e.target.checked)}
                        className="w-4 h-4 text-interactive bg-surface border-border rounded focus:ring-interactive focus:ring-2"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-text">
                        画像を他の人からも見えるようにする
                      </span>
                    </label>
                    <div className="mt-1 text-xs text-text-muted">
                      チェックしない場合、画像は自分にのみ表示されます
                    </div>
                  </div>
                )}

                <ErrorMessage error={error} />

                <PostActions
                  onSubmit={() => handleSubmit()}
                  remainingChars={remainingChars}
                  isSubmitting={isSubmitting}
                  isValid={isValid}
                  effectiveLength={effectiveLength}
                  actualLength={actualLength}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 破棄確認ダイアログ */}
      {showDiscardDialog && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-[60] p-4">
          <div className="bg-surface rounded-lg max-w-sm w-full p-6 border border-border">
            <h3 className="text-lg font-semibold text-text mb-4">
              投稿を破棄しますか？
            </h3>
            <p className="text-text-secondary mb-6 text-sm">
              入力した内容は保存されません。本当に破棄してもよろしいですか？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDiscardCancel}
                className="px-4 py-2 border border-border rounded-lg text-text hover:bg-surface-hover transition-colors"
              >
                いいえ
              </button>
              <button
                onClick={handleDiscardConfirm}
                className="px-4 py-2 bg-error text-text-inverse rounded-lg hover:bg-error/90 transition-colors"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostModal;
