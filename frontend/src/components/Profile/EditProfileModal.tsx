"use client";

import React, { useState } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { User } from "@/api";
import { UsersApi } from "@/api/users";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}) => {
  const [name, setName] = useState(user.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }

    if (name.trim() === user.name) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedUser = await UsersApi.updateUser(user.id, {
        name: name.trim(),
      });
      onUserUpdated(updatedUser);
      onClose();
    } catch (err) {
      console.error("Failed to update user:", err);
      setError("プロフィールの更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName(user.name || "");
    setError(null);
    onClose();
  };

  const { handleKeyDown } = useKeyboardShortcuts({
    onSubmit: () => handleSubmit(),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">
            プロフィールを編集
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-surface-hover transition-colors"
            disabled={isSubmitting}
          >
            <IconX size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text mb-2"
            >
              表示名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-interactive bg-surface text-text"
              placeholder="表示名を入力"
              maxLength={50}
              disabled={isSubmitting}
            />
            <div className="text-right text-xs text-text-muted mt-1">
              {name.length}/50
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-hover transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-interactive text-text-inverse rounded-lg hover:bg-interactive-hover transition-colors disabled:bg-interactive-disabled flex items-center gap-2"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  保存
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
