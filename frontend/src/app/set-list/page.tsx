"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import BaseLayout from "@/components/layout/BaseLayout";
import { useCharacters } from "@/hooks/queries/useCharacters";
import { IconUser, IconHash } from "@tabler/icons-react";

export default function SetList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: characters, isLoading, error } = useCharacters();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </BaseLayout>
    );
  }

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div>キャラクターを読み込み中...</div>
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-error">キャラクターの読み込みに失敗しました</div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
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
        <div className="min-h-screen">
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
                        <h3 className="text-lg font-medium text-text truncate">
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
      </div>
    </BaseLayout>
  );
}
