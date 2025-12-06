"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useCharacters } from "@/hooks/queries/useCharacters";
import { IconUser, IconHash, IconEdit } from "@tabler/icons-react";
import EditCharacterModal from "@/components/EditCharacterModal";
import type { Character } from "@/api";

const SetListView = () => {
  const { status } = useSession();
  const { data: characters, isLoading, error } = useCharacters();
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );

  // 認証チェック中はローディング表示
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div>読み込み中...</div>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（HybridSPAAuthがリダイレクトを処理）
  if (status === "unauthenticated") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>キャラクターを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">キャラクターの読み込みに失敗しました</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center gap-3">
        <IconHash size={24} className="text-primary" />
        <h1 className="text-xl font-bold text-text">セトリ</h1>
        {characters && (
          <span className="bg-surface-variant text-text-secondary text-xs px-2 py-1 rounded-full">
            {characters.length}キャラ
          </span>
        )}
      </div>

      {/* キャラクター一覧 */}
      <div>
        {characters && characters.length > 0 ? (
          <div>
            {characters.map((character) => (
              <div
                key={character.id}
                className="bg-surface hover:bg-surface-elevated transition-colors duration-200 border-b border-border py-6 px-6"
              >
                <div className="flex items-center gap-4">
                  {/* キャラクターアイコン */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                      <IconUser size={24} className="text-primary" />
                    </div>
                  </div>

                  {/* キャラクター情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-text break-all overflow-wrap-anywhere">
                        {character.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span>投稿数: {character._count?.posts || 0}回</span>
                      <span>
                        作成日:{" "}
                        {new Date(character.createdAt).toLocaleDateString(
                          "ja-JP",
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 編集ボタン */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setEditingCharacter(character)}
                      className="p-2 text-text-secondary hover:text-text hover:bg-surface-elevated rounded-full transition-colors"
                      title="キャラクターを編集"
                    >
                      <IconEdit size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-text-muted">
            <IconUser size={48} className="mb-4" />
            <p className="text-lg">キャラクターがありません</p>
            <p className="text-sm mt-2">
              投稿時にキャラクターを作成すると、ここに表示されます
            </p>
          </div>
        )}
      </div>

      {/* キャラクター編集モーダル */}
      <EditCharacterModal
        isOpen={!!editingCharacter}
        character={editingCharacter}
        onClose={() => setEditingCharacter(null)}
        onSuccess={() => {
          // 成功時のトーストやリフレッシュ処理をここに追加可能
        }}
      />
    </div>
  );
};

export default SetListView;
