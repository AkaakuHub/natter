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
        className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        title="投稿のオプション"
      >
        <IconDots size={20} />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <button
            onClick={handleEdit}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
          >
            <IconEdit size={18} className="text-gray-600" />
            <span className="text-gray-700 font-medium">編集</span>
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={handleDelete}
            className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors group"
          >
            <IconTrash
              size={18}
              className="text-gray-600 group-hover:text-red-500"
            />
            <span className="text-gray-700 font-medium group-hover:text-red-500">
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