"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { IconPlus, IconX } from "@tabler/icons-react";
import {
  useCharacters,
  useCreateCharacter,
  useSearchCharacters,
} from "@/hooks/queries/useCharacters";
import {
  getCharacterColorStyle,
  getCharacterTextColor,
} from "@/utils/characterColorUtils";
import type { Character } from "@/api";

interface CharacterTagSelectorProps {
  selectedCharacter?: Character | null;
  onCharacterChange: (character: Character | null) => void;
}

export interface CharacterTagSelectorHandle {
  ensureCharacterSelection: () => Promise<Character | null>;
}

const CharacterTagSelector = forwardRef<
  CharacterTagSelectorHandle,
  CharacterTagSelectorProps
>(({ selectedCharacter, onCharacterChange }, ref) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addFormRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
  const handleCreateCharacter = async (): Promise<Character | null> => {
    const trimmedName = inputValue.trim();
    if (!trimmedName) return null;

    // 文字数制限チェック（50文字）
    if (trimmedName.length > 50) {
      alert("キャラクター名は50文字以内で入力してください");
      return null;
    }

    // 既存のキャラクターに同じ名前があるかチェック
    const existingCharacter = characters.find(
      (char) => char.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existingCharacter) {
      alert("同じ名前のキャラクターが既に存在します");
      return null;
    }

    try {
      const newCharacter = await createCharacterMutation.mutateAsync({
        name: trimmedName,
      });
      onCharacterChange(newCharacter);
      setInputValue("");
      setIsDropdownOpen(false);
      return newCharacter;
    } catch (error) {
      console.error("Failed to create character:", error);
      alert(
        "キャラクターの作成に失敗しました: " +
          (error instanceof Error ? error.message : "不明なエラー"),
      );
      return null;
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
    updateDropdownPosition();
    setIsDropdownOpen(true);
  };

  // ドロップダウンの位置を計算
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // 入力フォーカス
  const handleInputFocus = () => {
    updateDropdownPosition();
    setIsDropdownOpen(true);
  };

  // ウィンドウリサイズ時の位置更新
  useEffect(() => {
    const handleResize = () => {
      if (isDropdownOpen) {
        updateDropdownPosition();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isDropdownOpen]);

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

  useImperativeHandle(ref, () => ({
    async ensureCharacterSelection() {
      if (selectedCharacter) {
        return selectedCharacter;
      }

      const trimmedName = inputValue.trim();
      if (!trimmedName) {
        return null;
      }

      const existingCharacter = characters.find(
        (char) => char.name.toLowerCase() === trimmedName.toLowerCase(),
      );

      if (existingCharacter) {
        handleSelectCharacter(existingCharacter);
        return existingCharacter;
      }

      return await handleCreateCharacter();
    },
  }));

  return (
    <div className="w-full">
      <div className="mb-3">
        <div className="flex items-center gap-3 mb-4 h-8">
          <label className="block text-sm font-medium text-text">
            キャラクター
          </label>

          {/* 選択されたキャラクタータグ */}
          {selectedCharacter && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1 border rounded-full"
              style={getCharacterColorStyle(selectedCharacter.name, 0.5)}
            >
              <span
                className="text-sm font-medium break-words word-break-break-all whitespace-normal min-w-0 flex-1"
                style={{ color: getCharacterTextColor(selectedCharacter.name) }}
              >
                {selectedCharacter.name}
              </span>
              <button
                type="button"
                onClick={handleRemoveTag}
                className="p-0.5 hover:bg-surface-hover rounded-full transition-colors"
              >
                <IconX
                  size={14}
                  style={{
                    color: getCharacterTextColor(selectedCharacter.name),
                  }}
                />
              </button>
            </div>
          )}
        </div>

        {/* 入力欄とドロップダウン */}
        <div ref={containerRef} className="relative">
          <div className="flex gap-2 items-start">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyPress}
                placeholder="キャラクター名を入力..."
                maxLength={50}
                className="w-full px-4 py-3 sm:py-2 pr-12 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary text-base sm:text-sm transition-colors"
                style={{ fontSize: "16px" }}
              />
              {/* 文字数カウンター */}
              <div
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs pointer-events-none ${
                  inputValue.length > 45 ? "text-error" : "text-text-muted"
                }`}
              >
                {inputValue.length}/50
              </div>
            </div>

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
                  className="inline-flex items-center gap-1 px-3 py-3 sm:py-2 bg-interactive text-text-inverse rounded-lg text-sm hover:bg-interactive-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <IconPlus size={14} />
                  <span>追加</span>
                </button>
              )}
          </div>

          {/* 文字数制限警告 */}
          {inputValue.length > 45 && (
            <div className="mt-1 text-xs text-error">
              文字数制限に近づいています（残り{50 - inputValue.length}文字）
            </div>
          )}

          {/* ドロップダウンメニュー（ポータル） */}
          {isDropdownOpen &&
            typeof window !== "undefined" &&
            createPortal(
              <div
                ref={dropdownRef}
                className="fixed bg-surface border border-border rounded-lg shadow-lg z-[9999] max-h-48 overflow-hidden transform-gpu"
                style={{
                  top: dropdownPosition.top + 4,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  pointerEvents: "auto",
                }}
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
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-sm font-medium text-text break-words word-break-break-all whitespace-normal min-w-0 flex-1">
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
              </div>,
              document.body,
            )}
        </div>
      </div>
    </div>
  );
});

CharacterTagSelector.displayName = "CharacterTagSelector";

export default CharacterTagSelector;
