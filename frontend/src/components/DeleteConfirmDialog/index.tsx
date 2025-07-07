"use client";

import React from "react";
import { IconTrash, IconX } from "@tabler/icons-react";
import { Post } from "@/api/types";
import { usePostDelete } from "@/hooks/usePostDelete";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  post: Post;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

const DeleteConfirmDialog = ({
  isOpen,
  post,
  onClose,
  onDeleteSuccess,
}: DeleteConfirmDialogProps) => {
  const { isDeleting, deletePost } = usePostDelete();

  const handleDelete = async () => {
    const success = await deletePost(post.id);
    if (success) {
      onDeleteSuccess?.();
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <IconTrash size={20} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">投稿を削除</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full p-2 transition-colors duration-200 disabled:opacity-50"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            この投稿を削除してもよろしいですか？この操作は取り消すことができません。
          </p>

          {/* 投稿のプレビュー */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-gray-700 text-sm line-clamp-3">
              {post.content}
            </p>
            {post.images && post.images.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                画像 {post.images.length} 枚が添付されています
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;