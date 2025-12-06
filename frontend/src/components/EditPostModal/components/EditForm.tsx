import React, { useEffect, useRef } from "react";
import ImagePreview from "@/components/CreatePost/components/ImagePreview";
import ImageDropZone from "@/components/CreatePost/components/ImageDropZone";
import { useClipboardImagePaste } from "@/hooks/useClipboardImagePaste";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface EditFormProps {
  content: string;
  onContentChange: (content: string) => void;
  imagePreviewUrls: string[];
  onImageRemove: (index: number) => void;
  onImageAdd: () => void;
  onFilesAdd: (files: File[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  remainingChars: number;
  isSubmitting: boolean;
  isValid: boolean;
  hasChanges: boolean;
  characterLimit: number;
  autoFocus?: boolean;
  maxImages: number;
}

const EditForm = ({
  content,
  onContentChange,
  imagePreviewUrls,
  onImageRemove,
  onImageAdd,
  onFilesAdd,
  onSubmit,
  remainingChars,
  isSubmitting,
  isValid,
  hasChanges,
  characterLimit,
  autoFocus = false,
  maxImages,
}: EditFormProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const canAddMore = imagePreviewUrls.length < maxImages;

  useClipboardImagePaste({
    enabled: canAddMore && !isSubmitting,
    onPasteImages: onFilesAdd,
    containerRef: formRef,
  });

  const { handleKeyDown } = useKeyboardShortcuts({
    onSubmit: () => {
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      onSubmit(syntheticEvent);
    },
    canSubmit: isValid && hasChanges && !isSubmitting,
  });

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      // 少し遅延を入れてフォーカスを設定（モーダルアニメーション完了後）
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        // カーソルを末尾に移動
        const textLength = textareaRef.current?.value.length || 0;
        textareaRef.current?.setSelectionRange(textLength, textLength);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="p-4">
      <div className="flex flex-col gap-4">
        {/* テキストエリア */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="投稿内容を編集"
          className="w-full resize-none border-none outline-none text-lg placeholder-text-muted bg-transparent min-h-[120px]"
          maxLength={characterLimit}
          disabled={isSubmitting}
          style={{ fontSize: "16px" }}
        />

        {/* 画像プレビュー */}
        <ImagePreview imageUrls={imagePreviewUrls} onRemove={onImageRemove} />
        <ImageDropZone
          onFilesAdd={onFilesAdd}
          onRequestFileDialog={onImageAdd}
          disabled={isSubmitting}
          canAddMore={canAddMore}
          maxImages={maxImages}
        />

        {/* ボタンエリア */}
        <div className="flex items-center justify-between pt-4 border-t border-border-muted">
          <div className="flex items-center gap-4">
            <span
              className={`text-sm ${
                remainingChars < 20
                  ? remainingChars < 0
                    ? "text-error"
                    : "text-warning"
                  : "text-text-muted"
              }`}
            >
              {remainingChars}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValid || !hasChanges}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
              isSubmitting || !isValid || !hasChanges
                ? "bg-surface-variant text-text-muted cursor-not-allowed"
                : "bg-interactive text-text-inverse hover:bg-interactive-hover hover:shadow-lg"
            }`}
          >
            {isSubmitting ? "更新中..." : "更新"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditForm;
