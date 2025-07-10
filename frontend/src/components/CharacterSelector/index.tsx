"use client";

import React, { useState, useRef, useEffect } from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  useCharacters,
  useCreateCharacter,
  useSearchCharacters,
} from "@/hooks/queries/useCharacters";
import type { Character } from "@/api";

interface CharacterSelectorProps {
  selectedCharacter?: Character | null;
  onCharacterChange: (character: Character | null) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  selectedCharacter,
  onCharacterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCharacterName, setNewCharacterName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: characters = [], error: charactersError } = useCharacters();
  const { data: searchResults = [] } = useSearchCharacters(searchQuery);
  const createCharacterMutation = useCreateCharacter();

  // 検索クエリに基づいて表示するキャラクターを決定
  const displayCharacters = searchQuery ? searchResults : characters;

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // キャラクター作成
  const handleCreateCharacter = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newCharacterName.trim()) return;

    try {
      const newCharacter = await createCharacterMutation.mutateAsync({
        name: newCharacterName.trim(),
      });
      onCharacterChange(newCharacter);
      setNewCharacterName("");
      setSearchQuery("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create character:", error);
    }
  };

  // 入力値の変更処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (selectedCharacter) {
      // 既存のキャラクターが選択されている場合、クリア
      onCharacterChange(null);
    }
    setNewCharacterName(value);
    setSearchQuery(value);
  };

  // キャラクター選択
  const handleSelectCharacter = (character: Character) => {
    onCharacterChange(character);
    setNewCharacterName("");
    setSearchQuery("");
    setIsOpen(false);
  };

  // フォーカス時の処理
  const handleFocus = () => {
    setIsOpen(true);
  };

  // クリアボタン
  const handleClear = () => {
    onCharacterChange(null);
    setNewCharacterName("");
    setSearchQuery("");
    setIsOpen(false);
  };

  // デバッグ用コンソールログ
  useEffect(() => {
    console.log("CharacterSelector - characters:", characters);
    console.log("CharacterSelector - error:", charactersError);
  }, [characters, charactersError]);

  return (
    <div className="w-full relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1">
          <input
            type="text"
            value={selectedCharacter?.name || newCharacterName}
            onChange={handleInputChange}
            placeholder="キャラクター名を入力..."
            className="w-full px-4 py-3 sm:py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm transition-colors"
            style={{ fontSize: "16px" }}
            onFocus={handleFocus}
            ref={inputRef}
          />
        </div>
        {(selectedCharacter || newCharacterName) && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-3 sm:px-3 sm:py-2 text-text-muted hover:text-text active:text-text transition-colors touch-manipulation text-xl sm:text-base"
            title="クリア"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 sm:max-h-64 overflow-y-auto z-10 animate-fade-in"
        >
          {/* 既存のキャラクター一覧 */}
          {!charactersError && displayCharacters.length > 0 && (
            <div className="max-h-32 sm:max-h-48 overflow-y-auto">
              {displayCharacters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => handleSelectCharacter(character)}
                  className="w-full px-4 py-4 sm:px-3 sm:py-2 text-left hover:bg-surface-hover active:bg-surface-hover transition-colors border-b border-border last:border-b-0 touch-manipulation"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-text text-base sm:text-sm font-medium">
                      {character.name}
                    </span>
                    <span className="text-xs sm:text-xs text-text-muted">
                      {character.postsCount || 0}回使用
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 新規作成オプション */}
          {newCharacterName.trim() && (
            <div
              className={
                displayCharacters.length > 0 ? "border-t border-border" : ""
              }
            >
              <button
                onClick={handleCreateCharacter}
                disabled={createCharacterMutation.isPending}
                className="w-full px-4 py-4 sm:px-3 sm:py-2 text-left hover:bg-surface-hover active:bg-surface-hover transition-colors flex items-center gap-3 sm:gap-2 touch-manipulation"
              >
                <IconPlus size={18} className="text-primary sm:w-4 sm:h-4" />
                <span className="text-text text-base sm:text-sm font-medium">
                  {createCharacterMutation.isPending
                    ? "作成中..."
                    : `「${newCharacterName}」を作成`}
                </span>
              </button>
            </div>
          )}

          {/* 空の状態 */}
          {!charactersError &&
            displayCharacters.length === 0 &&
            !newCharacterName.trim() && (
              <div className="p-4 sm:p-3 text-center text-text-muted text-sm">
                キャラクター名を入力してください
              </div>
            )}

          {/* エラー表示 */}
          {charactersError && (
            <div className="p-4 sm:p-3 text-center text-error text-sm">
              キャラクターの読み込みに失敗しました
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterSelector;
