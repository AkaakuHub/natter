"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { User } from "@/api";
import { useToast } from "@/hooks/useToast";
import { useNavigation } from "@/hooks/useNavigation";

interface CreatePostProps {
  onPostCreated?: () => void;
  currentUser?: User | null;
}

const CreatePost = ({ onPostCreated, currentUser }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { navigateToPost } = useNavigation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) {
      setError("投稿内容または画像を入力してください");
      return;
    }

    if (!currentUser) {
      setError("ユーザー情報が取得できません");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log(
        "Creating post with authorId:",
        currentUser.id,
        typeof currentUser.id,
      );

      // FormDataを使用してファイルを送信
      const formData = new FormData();
      if (content.trim()) {
        formData.append("content", content.trim());
      }
      formData.append("authorId", currentUser.id);

      // 画像ファイルを追加
      images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("投稿の作成に失敗しました");
      }

      // 作成されたポストの情報を取得
      const newPost = await response.json();

      // 成功時の処理
      setContent("");
      setImages([]);
      setImagePreviewUrls([]);
      onPostCreated?.();

      // トースト通知を表示（クリックで作成したポストへ遷移）
      showToast("投稿を作成しました。", "success", 3000, () => {
        navigateToPost(newPost.id);
      });
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("投稿の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageAdd = () => {
    if (images.length >= 10) {
      alert("画像は最大10枚までアップロードできます");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileArray = Array.from(files);
        const remainingSlots = 10 - images.length;
        const filesToAdd = fileArray.slice(0, remainingSlots);

        setImages((prev) => [...prev, ...filesToAdd]);

        // プレビュー用のURLを生成
        const previewUrls = filesToAdd.map((file) => URL.createObjectURL(file));
        setImagePreviewUrls((prev) => [...prev, ...previewUrls]);

        if (fileArray.length > remainingSlots) {
          alert(
            `画像は最大10枚までです。${remainingSlots}枚のみ追加されました。`,
          );
        }
      }
    };

    input.click();
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      // メモリリークを避けるために古いURLを削除
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const characterLimit = 280;
  const remainingChars = characterLimit - content.length;

  return (
    <div className="border-b border-gray-100/60 p-6 bg-white/90 backdrop-blur-sm rounded-3xl mx-4 mb-6 shadow-soft hover:shadow-glow transition-all duration-300">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* ユーザーアバター */}
          <div className="relative">
            <Image
              src={currentUser?.image || "/no_avatar_image_128x128.png"}
              alt={currentUser?.name || "User"}
              className="w-12 h-12 rounded-full ring-2 ring-gray-100 hover:ring-primary/30 transition-all duration-300"
              width={48}
              height={48}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          </div>

          {/* 投稿作成エリア */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今何してる？"
              className="w-full resize-none border-none outline-none text-xl placeholder-gray-400 bg-transparent leading-relaxed font-medium focus:placeholder-gray-300 transition-all duration-300"
              rows={3}
              maxLength={characterLimit}
              disabled={isSubmitting}
            />

            {/* 添付画像プレビュー */}
            {imagePreviewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {imagePreviewUrls.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={imageUrl}
                      alt={`添付画像 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300"
                      width={200}
                      height={128}
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300 hover:scale-110"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* エラーメッセージ */}
            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

            {/* 投稿ボタンエリア */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100/80">
              <div className="flex items-center gap-4">
                {/* 画像追加ボタン */}
                <button
                  type="button"
                  onClick={handleImageAdd}
                  disabled={isSubmitting || images.length >= 10}
                  className="text-blue-500 hover:text-blue-600 disabled:opacity-50 p-2 rounded-full hover:bg-blue-50 transition-all duration-300"
                  title={
                    images.length >= 10 ? "画像は最大10枚まで" : "画像を追加"
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
                type="submit"
                disabled={
                  isSubmitting ||
                  (!content.trim() && images.length === 0) ||
                  remainingChars < 0
                }
                className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-soft hover:shadow-glow hover:scale-105 ${
                  isSubmitting ||
                  (!content.trim() && images.length === 0) ||
                  remainingChars < 0
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isSubmitting ? "投稿中..." : "投稿"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
