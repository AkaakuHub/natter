"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IconX, IconPhoto } from "@tabler/icons-react";
import { User } from "@/api";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyToPost: {
    id: number;
    content: string;
    author: {
      name: string;
      image?: string;
    };
  };
  currentUser?: User | null;
  onReplySubmit: (content: string, images: File[]) => Promise<void>;
}

const ReplyModal = ({
  isOpen,
  onClose,
  replyToPost,
  currentUser,
  onReplySubmit,
}: ReplyModalProps) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) return;

    try {
      setIsSubmitting(true);
      await onReplySubmit(content.trim(), images);
      setContent("");
      setImages([]);
      setImagePreviewUrls([]);
      onClose();
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageAdd = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileArray = Array.from(files);
        setImages((prev) => [...prev, ...fileArray]);

        const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
        setImagePreviewUrls((prev) => [...prev, ...previewUrls]);
      }
    };

    input.click();
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const characterLimit = 280;
  const remainingChars = characterLimit - content.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full mt-16 max-h-[80vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">リプライを投稿</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* 元の投稿 */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-3">
            <Image
              src={replyToPost.author.image || "/no_avatar_image_128x128.png"}
              alt={replyToPost.author.name}
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
            <div className="flex-1">
              <div className="font-medium text-sm">
                {replyToPost.author.name}
              </div>
              <div className="text-gray-700 text-sm mt-1">
                {replyToPost.content}
              </div>
            </div>
          </div>
        </div>

        {/* リプライ入力フォーム */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-3">
            <Image
              src={currentUser?.image || "/no_avatar_image_128x128.png"}
              alt={currentUser?.name || "User"}
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="リプライを投稿"
                className="w-full resize-none border-none outline-none text-lg placeholder-gray-500 bg-transparent"
                rows={4}
                maxLength={characterLimit}
                disabled={isSubmitting}
              />

              {/* 画像プレビュー */}
              {imagePreviewUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {imagePreviewUrls.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={imageUrl}
                        alt={`添付画像 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        width={150}
                        height={96}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
                      >
                        <IconX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ボタンエリア */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleImageAdd}
                disabled={isSubmitting}
                className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
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
              disabled={
                isSubmitting ||
                (!content.trim() && images.length === 0) ||
                remainingChars < 0
              }
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                isSubmitting ||
                (!content.trim() && images.length === 0) ||
                remainingChars < 0
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? "送信中..." : "リプライ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyModal;
