import React, { useEffect, useRef } from "react";
import { IconPhoto } from "@tabler/icons-react";
import ImagePreview from "@/components/CreatePost/components/ImagePreview";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface EditFormProps {
  content: string;
  onContentChange: (content: string) => void;
  imagePreviewUrls: string[];
  onImageRemove: (index: number) => void;
  onImageAdd: () => void;
  onSubmit: (e: React.FormEvent) => void;
  remainingChars: number;
  isSubmitting: boolean;
  isValid: boolean;
  hasChanges: boolean;
  characterLimit: number;
  autoFocus?: boolean;
}

const EditForm = ({
  content,
  onContentChange,
  imagePreviewUrls,
  onImageRemove,
  onImageAdd,
  onSubmit,
  remainingChars,
  isSubmitting,
  isValid,
  hasChanges,
  characterLimit,
  autoFocus = false,
}: EditFormProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <form onSubmit={onSubmit} className="p-4">
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

        {/* ボタンエリア */}
        <div className="flex items-center justify-between pt-4 border-t border-border-muted">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onImageAdd}
              disabled={isSubmitting || imagePreviewUrls.length >= 10}
              className="text-interactive hover:text-interactive-hover disabled:opacity-50 p-2 rounded-full hover:bg-interactive-bg transition-all duration-300 cursor-pointer"
              title={
                imagePreviewUrls.length >= 10
                  ? "画像は最大10枚まで"
                  : "画像を追加"
              }
            >
              <IconPhoto size={20} />
            </button>
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
