import React from "react";
import Image from "next/image";
import { IconPhoto } from "@tabler/icons-react";
import { User } from "@/api";
import PostTextArea from "@/components/CreatePost/components/PostTextArea";
import ImagePreview from "@/components/CreatePost/components/ImagePreview";

interface ReplyFormProps {
  currentUser?: User | null;
  content: string;
  onContentChange: (content: string) => void;
  imagePreviewUrls: string[];
  onImageRemove: (index: number) => void;
  onImageAdd: () => void;
  onSubmit: (e: React.FormEvent) => void;
  remainingChars: number;
  isSubmitting: boolean;
  isValid: boolean;
  effectiveLength?: number;
  actualLength?: number;
}

const ReplyForm = ({
  currentUser,
  content,
  onContentChange,
  imagePreviewUrls,
  onImageRemove,
  onImageAdd,
  onSubmit,
  remainingChars,
  isSubmitting,
  isValid,
  effectiveLength,
  actualLength,
}: ReplyFormProps) => {
  const handleKeyboardSubmit = () => {
    if (isValid && !isSubmitting) {
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      onSubmit(syntheticEvent);
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4">
      <div className="flex gap-3">
        <Image
          src={currentUser?.image || "/no_avatar_image_128x128.png"}
          alt={currentUser?.name || "User"}
          className="w-10 h-10 rounded-full"
          width={40}
          height={40}
        />
        <div className="flex-1">
          <PostTextArea
            value={content}
            onChange={onContentChange}
            placeholder="リプライを投稿"
            characterLimit={280}
            disabled={isSubmitting}
            onSubmit={handleKeyboardSubmit}
            autoFocus={true}
          />

          <ImagePreview imageUrls={imagePreviewUrls} onRemove={onImageRemove} />
        </div>
      </div>

      {/* ボタンエリア */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-muted">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onImageAdd}
            disabled={isSubmitting}
            className="text-interactive hover:text-interactive-hover disabled:text-interactive-disabled transition-colors duration-200"
          >
            <IconPhoto size={20} />
          </button>
          <div className="flex items-center gap-2">
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
            {effectiveLength !== undefined &&
              actualLength !== undefined &&
              effectiveLength !== actualLength && (
                <span
                  className="text-xs text-text-muted"
                  title={`実際の文字数: ${actualLength}文字\n有効文字数: ${effectiveLength}文字 (URLは1/5でカウント)`}
                >
                  ({effectiveLength}/{actualLength})
                </span>
              )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
            isSubmitting || !isValid
              ? "bg-interactive-disabled text-text-inverse cursor-not-allowed"
              : "bg-interactive text-text-inverse hover:bg-interactive-hover"
          }`}
        >
          {isSubmitting ? "送信中..." : "リプライ"}
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;
