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
}: ReplyFormProps) => {
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
          />

          <ImagePreview imageUrls={imagePreviewUrls} onRemove={onImageRemove} />
        </div>
      </div>

      {/* ボタンエリア */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onImageAdd}
            disabled={isSubmitting}
            className="text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-colors duration-200"
          >
            <IconPhoto size={20} />
          </button>
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
          disabled={isSubmitting || !isValid}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
            isSubmitting || !isValid
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg"
          }`}
        >
          {isSubmitting ? "送信中..." : "リプライ"}
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;
