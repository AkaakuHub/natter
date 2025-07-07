"use client";

import React, { useState } from "react";
import { User } from "@/api";
import { useImageUpload } from "@/hooks/useImageUpload";
import { usePostSubmit } from "@/hooks/usePostSubmit";
import { useFormValidation } from "@/hooks/useFormValidation";

import UserAvatar from "./components/UserAvatar";
import PostTextArea from "./components/PostTextArea";
import ImagePreview from "./components/ImagePreview";
import ErrorMessage from "./components/ErrorMessage";
import PostActions from "./components/PostActions";

interface CreatePostProps {
  onPostCreated?: () => void;
  currentUser?: User | null;
}

const CreatePost = ({ onPostCreated, currentUser }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const characterLimit = 280;

  const {
    images,
    imagePreviewUrls,
    handleImageAdd,
    handleImageRemove,
    clearImages,
  } = useImageUpload(10);
  const {
    isSubmitting,
    error,
    handleSubmit: submitPost,
  } = usePostSubmit(currentUser, onPostCreated);
  const { remainingChars, isValid } = useFormValidation(
    content,
    images.length,
    characterLimit,
  );

  // デバッグ用ログ
  console.log("CreatePost - currentUser:", currentUser);
  console.log("CreatePost - currentUser type:", typeof currentUser);

  // 認証されていない場合は投稿作成コンポーネントを表示しない
  if (!currentUser) {
    return (
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">投稿するにはログインが必要です。</p>
          <p className="text-sm text-gray-500 mb-4">認証状態を確認中...</p>
          <a
            href="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 inline-block"
          >
            ログイン
          </a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPost(content, images);

    // 成功時にフォームをクリア
    if (!error) {
      setContent("");
      clearImages();
    }
  };

  const handlePostSubmit = async () => {
    await submitPost(content, images);

    if (!error) {
      setContent("");
      clearImages();
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 py-6 px-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <UserAvatar user={currentUser} />

          <div className="flex-1">
            <PostTextArea
              value={content}
              onChange={setContent}
              characterLimit={characterLimit}
              disabled={isSubmitting}
            />

            <ImagePreview
              imageUrls={imagePreviewUrls}
              onRemove={handleImageRemove}
            />

            <ErrorMessage error={error} />

            <PostActions
              onImageAdd={handleImageAdd}
              onSubmit={handlePostSubmit}
              remainingChars={remainingChars}
              isSubmitting={isSubmitting}
              isValid={isValid}
              imageCount={images.length}
              maxImages={10}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
