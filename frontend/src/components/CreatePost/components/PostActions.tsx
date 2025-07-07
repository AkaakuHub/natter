import React from "react";
import { IconPhoto } from "@tabler/icons-react";

interface PostActionsProps {
  onImageAdd: () => void;
  onSubmit: () => void;
  remainingChars: number;
  isSubmitting: boolean;
  isValid: boolean;
  imageCount: number;
  maxImages: number;
}

const PostActions = ({
  onImageAdd,
  onSubmit,
  remainingChars,
  isSubmitting,
  isValid,
  imageCount,
  maxImages,
}: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-muted">
      <div className="flex items-center gap-4">
        {/* 画像追加ボタン */}
        <button
          type="button"
          onClick={onImageAdd}
          disabled={isSubmitting || imageCount >= maxImages}
          className="text-interactive hover:text-interactive-hover disabled:text-interactive-disabled p-2 rounded-full hover:bg-interactive/10 transition-all duration-200"
          title={
            imageCount >= maxImages
              ? `画像は最大${maxImages}枚まで`
              : "画像を追加"
          }
        >
          <IconPhoto size={20} />
        </button>

        {/* 文字数カウンター */}
        <span
          className={`text-sm font-medium ${
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

      {/* 投稿ボタン */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || !isValid}
        className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors duration-200 ${
          isSubmitting || !isValid
            ? "bg-interactive-disabled text-text-inverse cursor-not-allowed"
            : "bg-interactive text-text-inverse hover:bg-interactive-hover"
        }`}
      >
        {isSubmitting ? "投稿中..." : "投稿"}
      </button>
    </div>
  );
};

export default PostActions;
