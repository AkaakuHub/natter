"use client";

import React, { useState } from "react";
import { IconUser, IconX } from "@tabler/icons-react";
import { useUpdateCharacter } from "@/hooks/queries/useCharacters";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { Character } from "@/api";
import { cn } from "@/lib/utils";
import { ui } from "@/styles/ui";

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
      <div className={`${ui.surface.modal} p-6 w-full max-w-md mx-4`}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-variant rounded-md flex items-center justify-center">
              <IconUser size={20} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text">キャラクター編集</h2>
          </div>
          <button onClick={onClose} className={ui.button.icon}>
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
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${ui.button.secondary} flex-1`}
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={cn(
                ui.button.primary,
                "flex-1",
                isSubmitting || !name.trim()
                  ? "bg-interactive-disabled hover:bg-interactive-disabled"
                  : "",
              )}
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
