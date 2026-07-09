"use client";

import React from "react";
import { IconUser } from "@tabler/icons-react";
import { useCharacters } from "@/hooks/queries/useCharacters";
import SkeletonCard from "@/components/common/SkeletonCard";

interface CharacterListProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const CharacterList: React.FC<CharacterListProps> = ({
  userId,
  isOwnProfile = false,
}) => {
  const { data: characters = [], isLoading, error } = useCharacters(userId);

  if (isLoading) {
    return (
      <div className="p-4">
        <SkeletonCard />
        <SkeletonCard />
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="min-w-0 w-full">
                    <h4 className="font-medium text-text break-all whitespace-normal overflow-wrap-anywhere hyphens-auto">
                      {character.name}
                    </h4>
                    <p className="text-sm text-text-muted">
                      {character.postsCount || 0}回使用
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CharacterList;
