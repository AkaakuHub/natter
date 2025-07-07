import React from "react";
import { IconPhoto } from "@tabler/icons-react";
import ImagePreview from "@/components/CreatePost/components/ImagePreview";

interface EditFormProps {
  content: string;
  onContentChange: (content: string) => void;
  imagePreviewUrls: string[];
  onImageRemove: (index: number) => void;
  onImageAdd: (files: FileList) => void;
  onSubmit: (e: React.FormEvent) => void;
  remainingChars: number;
  isSubmitting: boolean;
  isValid: boolean;
  hasChanges: boolean;
  characterLimit: number;
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
}: EditFormProps) => {
  return (
    <form onSubmit={onSubmit} className="p-4">
      <div className="flex flex-col gap-4">
        {/* テキストエリア */}
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="投稿内容を編集"
          className="w-full resize-none border-none outline-none text-lg placeholder-gray-500 bg-transparent min-h-[120px]"
          maxLength={characterLimit}
          disabled={isSubmitting}
        />

        {/* 画像プレビュー */}
        <ImagePreview imageUrls={imagePreviewUrls} onRemove={onImageRemove} />

        {/* ボタンエリア */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <label
              className="text-blue-500 hover:text-blue-600 disabled:opacity-50 p-2 rounded-full hover:bg-blue-50 transition-all duration-300 cursor-pointer"
              title={
                imagePreviewUrls.length >= 10
                  ? "画像は最大10枚まで"
                  : "画像を追加"
              }
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && onImageAdd(e.target.files)}
                disabled={isSubmitting || imagePreviewUrls.length >= 10}
                className="hidden"
              />
              <IconPhoto size={20} />
            </label>
            <span
              className={`text-sm ${
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

          <button
            type="submit"
            disabled={isSubmitting || !isValid || !hasChanges}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
              isSubmitting || !isValid || !hasChanges
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg"
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
