"use client";

import React, { useState } from "react";
import { IconUser, IconX } from "@tabler/icons-react";
import { useUpdateCharacter } from "@/hooks/queries/useCharacters";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { Character } from "@/api";

interface EditCharacterModalProps {
  isOpen: boolean;
  character: Character | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditCharacterModal = ({
  isOpen,
  character,
  onClose,
  onSuccess,
}: EditCharacterModalProps) => {
  useScrollLock(isOpen);

  const [name, setName] = useState(character?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCharacterMutation = useUpdateCharacter();

  React.useEffect(() => {
    if (character) {
      setName(character.name);
    }
  }, [character]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character || !name.trim()) return;

    setIsSubmitting(true);
    try {
      await updateCharacterMutation.mutateAsync({
        id: character.id,
        data: { name: name.trim() },
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("キャラクター更新エラー:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !character) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-xl p-6 w-full max-w-md mx-4 border border-border">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <IconUser size={20} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text">キャラクター編集</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text transition-colors p-1 rounded-full hover:bg-surface-elevated"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="character-name"
              className="block text-sm font-medium text-text mb-2"
            >
              キャラクター名
            </label>
            <input
              id="character-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="キャラクター名を入力"
              className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-elevated transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 px-4 py-2 bg-primary text-text-inverse rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "更新中..." : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCharacterModal;
