"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { PostsApi } from "@/api";

interface CreatePostProps {
  onPostCreated?: () => void;
  currentUser?: {
    id: number;
    name: string;
    image?: string;
  };
}

const CreatePost = ({ onPostCreated, currentUser }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await PostsApi.createPost({
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        authorId: currentUser.id,
      });

      // 成功時の処理
      setContent("");
      setImages([]);
      onPostCreated?.();
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("投稿の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageAdd = () => {
    // 簡易的な画像URL入力（実際のアプリではファイルアップロード機能を実装）
    const imageUrl = prompt("画像URLを入力してください:");
    if (imageUrl && imageUrl.trim()) {
      setImages(prev => [...prev, imageUrl.trim()]);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const characterLimit = 280;
  const remainingChars = characterLimit - content.length;

  return (
    <div className="border-b border-gray-200 p-4 bg-white">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* ユーザーアバター */}
          <Image
            src={currentUser?.image || "/no_avatar_image_128x128.png"}
            alt={currentUser?.name || "User"}
            className="w-12 h-12 rounded-full"
            width={48}
            height={48}
          />
          
          {/* 投稿作成エリア */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今何してる？"
              className="w-full resize-none border-none outline-none text-xl placeholder-gray-500 bg-transparent"
              rows={3}
              maxLength={characterLimit}
              disabled={isSubmitting}
            />
            
            {/* 添付画像プレビュー */}
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image}
                      alt={`添付画像 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      width={200}
                      height={128}
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
            
            {/* エラーメッセージ */}
            {error && (
              <div className="mt-2 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {/* 投稿ボタンエリア */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {/* 画像追加ボタン */}
                <button
                  type="button"
                  onClick={handleImageAdd}
                  disabled={isSubmitting}
                  className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
                  title="画像を追加"
                >
                  <IconPhoto size={20} />
                </button>
                
                {/* 文字数カウンター */}
                <span className={`text-sm ${
                  remainingChars < 20 
                    ? remainingChars < 0 
                      ? 'text-red-500' 
                      : 'text-orange-500'
                    : 'text-gray-500'
                }`}>
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
                className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                  isSubmitting || (!content.trim() && images.length === 0) || remainingChars < 0
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isSubmitting ? '投稿中...' : '投稿'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;