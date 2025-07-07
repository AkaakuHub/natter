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
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100/80">
      <div className="flex items-center gap-4">
        {/* 画像追加ボタン */}
        <button
          type="button"
          onClick={onImageAdd}
          disabled={isSubmitting || imageCount >= maxImages}
          className="text-blue-500 hover:text-blue-600 disabled:opacity-50 p-2 rounded-full hover:bg-blue-50 transition-all duration-300"
          title={
            imageCount >= maxImages ? `画像は最大${maxImages}枚まで` : "画像を追加"
          }
        >
          <IconPhoto size={20} />
        </button>

        {/* 文字数カウンター */}
        <span
          className={`text-sm font-medium ${
            remainingChars < 20
              ? remainingChars < 0
                ? "text-red-500"
                : "text-orange-500"
              : "text-gray-500"
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
        className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-soft hover:shadow-glow hover:scale-105 ${
          isSubmitting || !isValid
            ? "bg-gray-300 text-white cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {isSubmitting ? "投稿中..." : "投稿"}
      </button>
    </div>
  );
};

export default PostActions;