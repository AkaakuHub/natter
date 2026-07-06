"use client";

import React from "react";
import { createPortal } from "react-dom";
import { IconTrash, IconX } from "@tabler/icons-react";
import { Post } from "@/api/types";
import { usePostDelete } from "@/hooks/usePostDelete";
import { ui } from "@/styles/ui";

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
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-overlay"
      onClick={handleBackdropClick}
    >
      <div
        className={`${ui.surface.modal} max-w-md w-full mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-border-muted">
          <div className="flex items-center gap-3">
            <div className="bg-error-bg rounded-md p-2">
              <IconTrash size={20} className="text-error" />
            </div>
            <h2 className="text-lg font-semibold text-text">投稿を削除</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={ui.button.icon}
          >
            <IconX size={20} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <p className="text-text-secondary mb-4">
            この投稿を削除してもよろしいですか？この操作は取り消すことができません。
          </p>

          {/* 投稿のプレビュー */}
          <div className={`${ui.surface.subtle} p-4 mb-6`}>
            <p className="text-text text-sm line-clamp-3">{post.content}</p>
            {(() => {
              // imagesの処理を正しく行う
              let imageArray: string[] = [];

              if (post.images) {
                if (Array.isArray(post.images)) {
                  imageArray = post.images;
                } else if (typeof post.images === "string") {
                  try {
                    const parsed = JSON.parse(post.images);
                    imageArray = Array.isArray(parsed) ? parsed : [];
                  } catch (e) {
                    console.error("Failed to parse images JSON:", e);
                    imageArray = [];
                  }
                }
              }

              // 実際に画像がある場合のみ表示
              return imageArray.length > 0 ? (
                <div className="mt-2 text-xs text-text-muted">
                  画像 {imageArray.length} 枚が添付されています
                </div>
              ) : null;
            })()}
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className={`${ui.button.secondary} flex-1`}
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`${ui.button.danger} flex-1`}
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default DeleteConfirmDialog;
