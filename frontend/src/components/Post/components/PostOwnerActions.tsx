import React, { useState } from "react";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import { useDropdown } from "@/hooks/useDropdown";
import { Post } from "@/api/types";
import EditPostModal from "@/components/EditPostModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface PostOwnerActionsProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: () => void;
}

const PostOwnerActions = ({
  post,
  onPostUpdate,
  onPostDelete,
}: PostOwnerActionsProps) => {
  const { isOpen, toggle, close, ref } = useDropdown();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
    close();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
    close();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleMenuClick}
        className="p-2 rounded-full text-text-muted hover:text-text hover:bg-surface-variant transition-colors duration-200"
        title="投稿のオプション"
      >
        <IconDots size={20} />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden z-[100]">
          <button
            onClick={handleEdit}
            className="w-full px-4 py-3 text-left hover:bg-surface-variant flex items-center gap-3 transition-colors"
          >
            <IconEdit size={18} className="text-text-muted" />
            <span className="text-text font-medium">編集</span>
          </button>
          <div className="border-t border-border-muted" />
          <button
            onClick={handleDelete}
            className="w-full px-4 py-3 text-left hover:bg-error-bg flex items-center gap-3 transition-colors group"
          >
            <IconTrash
              size={18}
              className="text-text-muted group-hover:text-error"
            />
            <span className="text-text font-medium group-hover:text-error">
              削除
            </span>
          </button>
        </div>
      )}

      {/* 編集モーダル */}
      <EditPostModal
        isOpen={showEditModal}
        post={post}
        onClose={() => setShowEditModal(false)}
        onEditSuccess={onPostUpdate}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        post={post}
        onClose={() => setShowDeleteDialog(false)}
        onDeleteSuccess={onPostDelete}
      />
    </div>
  );
};

export default PostOwnerActions;
