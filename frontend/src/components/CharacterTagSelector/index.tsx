"use client";

import React, { useState, useRef, useEffect } from "react";
import { IconPlus, IconX } from "@tabler/icons-react";
import {
  useCharacters,
  useCreateCharacter,
  useSearchCharacters,
} from "@/hooks/queries/useCharacters";
import type { Character } from "@/api";

interface CharacterTagSelectorProps {
  selectedCharacter?: Character | null;
  onCharacterChange: (character: Character | null) => void;
}

const CharacterTagSelector: React.FC<CharacterTagSelectorProps> = ({
  selectedCharacter,
  onCharacterChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addFormRef = useRef<HTMLDivElement>(null);

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
        addFormRef.current &&
        !addFormRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 新規キャラクター作成
  const handleCreateCharacter = async () => {
    if (!inputValue.trim()) return;

    // 既存のキャラクターに同じ名前があるかチェック
    const existingCharacter = characters.find(
      (char) => char.name.toLowerCase() === inputValue.trim().toLowerCase(),
    );

    if (existingCharacter) {
      alert("同じ名前のキャラクターが既に存在します");
      return;
    }

    try {
      console.log("Creating character with name:", inputValue.trim());
      const newCharacter = await createCharacterMutation.mutateAsync({
        name: inputValue.trim(),
      });
      console.log("Created character:", newCharacter);
      onCharacterChange(newCharacter);
      setInputValue("");
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Failed to create character:", error);
      alert(
        "キャラクターの作成に失敗しました: " +
          (error instanceof Error ? error.message : "不明なエラー"),
      );
    }
  };

  // 既存キャラクター選択
  const handleSelectCharacter = (character: Character) => {
    onCharacterChange(character);
    setInputValue("");
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  // タグを削除
  const handleRemoveTag = () => {
    onCharacterChange(null);
  };

  // 入力値の変更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
    setIsDropdownOpen(true);
  };

  // 入力フォーカス
  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  // Enterキーでの作成/選択
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // 完全一致するキャラクターがある場合は選択
      const exactMatch = characters.find(
        (char) => char.name.toLowerCase() === inputValue.trim().toLowerCase(),
      );

      if (exactMatch) {
        handleSelectCharacter(exactMatch);
      } else if (inputValue.trim()) {
        // 完全一致がない場合は新規作成
        handleCreateCharacter();
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="block text-sm font-medium text-text mb-2">
          キャラクター
        </label>

        {/* 選択されたキャラクタータグ */}
        <div className="flex items-center gap-2 mb-2 min-h-[40px]">
          {selectedCharacter && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <span className="text-sm font-medium text-primary">
                {selectedCharacter.name}
              </span>
              <button
                type="button"
                onClick={handleRemoveTag}
                className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
              >
                <IconX size={14} className="text-primary" />
              </button>
            </div>
          )}
        </div>

        {/* 入力欄とドロップダウン */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyPress={handleKeyPress}
            placeholder="キャラクター名を入力..."
            className="w-full px-4 py-3 sm:py-2 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm transition-colors"
            style={{ fontSize: "16px" }}
          />

          {/* 新規追加ボタン */}
          {inputValue.trim() &&
            !characters.find(
              (char) =>
                char.name.toLowerCase() === inputValue.trim().toLowerCase(),
            ) && (
              <button
                type="button"
                onClick={handleCreateCharacter}
                disabled={createCharacterMutation.isPending}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 bg-interactive text-text-inverse rounded text-xs hover:bg-interactive-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <IconPlus size={12} />
                <span>追加</span>
              </button>
            )}

          {/* ドロップダウンメニュー */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-hidden"
            >
              {/* キャラクター一覧 */}
              <div className="max-h-48 overflow-y-auto">
                {!charactersError && displayCharacters.length > 0 ? (
                  displayCharacters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => handleSelectCharacter(character)}
                      className="w-full px-3 py-2 text-left hover:bg-surface-hover transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-text">
                          {character.name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {character.postsCount || 0}回使用
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-text-muted">
                    {charactersError
                      ? "読み込みに失敗しました"
                      : inputValue.trim()
                        ? "新しいキャラクターを作成します"
                        : "キャラクター名を入力してください"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterTagSelector;
