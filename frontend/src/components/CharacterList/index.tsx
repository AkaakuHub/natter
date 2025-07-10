"use client";

import React, { useState } from "react";
import { IconUser } from "@tabler/icons-react";
import {
  useCharacters,
  // useDeleteCharacter,
  useUpdateCharacter,
} from "@/hooks/queries/useCharacters";
import type { Character } from "@/api";

interface CharacterListProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const CharacterList: React.FC<CharacterListProps> = ({
  userId,
  isOwnProfile = false,
}) => {
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [editName, setEditName] = useState("");

  const { data: characters = [], isLoading, error } = useCharacters(userId);
  // const deleteCharacterMutation = useDeleteCharacter();
  const updateCharacterMutation = useUpdateCharacter();

  // const handleEditStart = (character: Character) => {
  //   setEditingCharacter(character);
  //   setEditName(character.name);
  // };

  const handleEditSave = async () => {
    if (!editingCharacter || !editName.trim()) return;

    try {
      await updateCharacterMutation.mutateAsync({
        id: editingCharacter.id,
        data: { name: editName.trim() },
      });
      setEditingCharacter(null);
      setEditName("");
    } catch (error) {
      console.error("Failed to update character:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingCharacter(null);
    setEditName("");
  };

  // const handleDelete = async (character: Character) => {
  //   if (!confirm(`キャラクター「${character.name}」を削除しますか？`)) return;

  //   try {
  //     await deleteCharacterMutation.mutateAsync(character.id);
  //   } catch (error) {
  //     console.error("Failed to delete character:", error);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-text-muted">キャラクターを読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-error">キャラクターの読み込みに失敗しました</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 新規作成セクション - 自分のプロフィールでのみ表示 */}
      {/* {isOwnProfile && (
        <div className="mb-6 p-4 bg-surface-secondary rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-text mb-3">
            新しいキャラクター
          </h3>
          {isCreating ? (
            <div className="space-y-3">
              <input
                type="text"
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
                placeholder="キャラクター名を入力..."
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreate();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={
                    !newCharacterName.trim() ||
                    createCharacterMutation.isPending
                  }
                  className="px-4 py-2 bg-interactive text-text-inverse rounded-lg hover:bg-interactive-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <IconPlus size={16} />
                  {createCharacterMutation.isPending ? "作成中..." : "作成"}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewCharacterName("");
                  }}
                  className="px-4 py-2 bg-surface border border-border text-text rounded-lg hover:bg-surface-hover"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-interactive text-text-inverse rounded-lg hover:bg-interactive-hover flex items-center gap-2"
            >
              <IconPlus size={16} />
              新しいキャラクターを作成
            </button>
          )}
        </div>
      )} */}

      {/* キャラクター一覧 */}
      <div className="space-y-3">
        {characters.length === 0 ? (
          <div className="text-center py-12">
            <IconUser size={48} className="mx-auto text-text-muted mb-4" />
            <p className="text-text-muted mb-2">
              {isOwnProfile
                ? "まだキャラクターがありません"
                : "キャラクターがありません"}
            </p>
            {isOwnProfile && (
              <p className="text-sm text-text-muted">
                新しいキャラクターを作成して、投稿時に使用しましょう
              </p>
            )}
          </div>
        ) : (
          characters.map((character) => (
            <div
              key={character.id}
              className="p-4 bg-surface-secondary rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {isOwnProfile && editingCharacter?.id === character.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditSave();
                          }
                        }}
                      />
                      <button
                        onClick={handleEditSave}
                        disabled={
                          !editName.trim() || updateCharacterMutation.isPending
                        }
                        className="px-3 py-2 bg-interactive text-text-inverse text-sm rounded-lg hover:bg-interactive-hover disabled:opacity-50"
                      >
                        {updateCharacterMutation.isPending
                          ? "保存中..."
                          : "保存"}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-3 py-2 bg-surface border border-border text-text text-sm rounded-lg hover:bg-surface-hover"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-text">
                        {character.name}
                      </h4>
                      <p className="text-sm text-text-muted">
                        {character.postsCount || 0}回使用
                      </p>
                    </div>
                  )}
                </div>

                {/* {isOwnProfile && editingCharacter?.id !== character.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditStart(character)}
                      className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="編集"
                    >
                      <IconEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(character)}
                      disabled={deleteCharacterMutation.isPending}
                      className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                      title="削除"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                )} */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CharacterList;
