import React, { useEffect, useRef } from "react";
import type { Character } from "@/api/types";
import CharacterTagSelector, {
  CharacterTagSelectorHandle,
} from "@/components/CharacterTagSelector";
import ImagePreview from "@/components/CreatePost/components/ImagePreview";
import ImageDropZone from "@/components/CreatePost/components/ImageDropZone";
import { useClipboardImagePaste } from "@/hooks/useClipboardImagePaste";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { ui } from "@/styles/ui";

interface EditFormProps {
  content: string;
  onContentChange: (content: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  selectedCharacter: Character | null;
  onCharacterChange: (character: Character | null) => void;
  characterSelectorRef: React.RefObject<CharacterTagSelectorHandle | null>;
  imagePreviewUrls: string[];
  onImageRemove: (index: number) => void;
  onImageAdd: () => void;
  onFilesAdd: (files: File[]) => void | Promise<void>;
  imagesPublic: boolean;
  onImagesPublicChange: (imagesPublic: boolean) => void;
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
  url,
  onUrlChange,
  selectedCharacter,
  onCharacterChange,
  characterSelectorRef,
  imagePreviewUrls,
  onImageRemove,
  onImageAdd,
  onFilesAdd,
  imagesPublic,
  onImagesPublicChange,
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
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex-1 overflow-y-auto p-4"
    >
      <div className="flex flex-col gap-4">
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

        <CharacterTagSelector
          ref={characterSelectorRef}
          selectedCharacter={selectedCharacter}
          onCharacterChange={onCharacterChange}
        />

        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 500) {
                onUrlChange(value);
              }
            }}
            placeholder="URL（他の人には見えません）"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="mt-1 text-xs text-text-muted">
            {url.length}/500文字
          </div>
        </div>

        <ImagePreview imageUrls={imagePreviewUrls} onRemove={onImageRemove} />
        <ImageDropZone
          onFilesAdd={onFilesAdd}
          onRequestFileDialog={onImageAdd}
          disabled={isSubmitting}
          canAddMore={canAddMore}
          maxImages={maxImages}
        />

        {imagePreviewUrls.length > 0 && (
          <div className={`${ui.surface.subtle} p-3`}>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={imagesPublic}
                onChange={(e) => onImagesPublicChange(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-surface text-interactive focus:ring-2 focus:ring-interactive"
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
            className={cn(
              ui.button.primary,
              isSubmitting || !isValid || !hasChanges
                ? "bg-surface-variant text-text-muted hover:bg-surface-variant"
                : "",
            )}
          >
            {isSubmitting ? "更新中..." : "更新"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditForm;
