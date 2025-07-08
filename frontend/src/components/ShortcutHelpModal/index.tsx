"use client";

import React from "react";
import { IconX, IconKeyboard } from "@tabler/icons-react";

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    key: "n",
    description: "新しい投稿を作成",
    category: "投稿",
  },
  {
    key: "/",
    description: "検索",
    category: "ナビゲーション",
  },
  {
    key: "h",
    description: "ホームに移動",
    category: "ナビゲーション",
  },
  {
    key: "p",
    description: "プロフィールに移動",
    category: "ナビゲーション",
  },
  {
    key: "i",
    description: "通知に移動",
    category: "ナビゲーション",
  },
  {
    key: "?",
    description: "このヘルプを表示",
    category: "ヘルプ",
  },
  {
    key: "Ctrl + Enter",
    description: "投稿を送信（投稿作成時）",
    category: "投稿",
  },
  {
    key: "Esc",
    description: "モーダルを閉じる",
    category: "全般",
  },
];

const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, typeof shortcuts>,
  );

  return (
    <div
      className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <IconKeyboard size={20} className="text-interactive" />
            <h2 className="text-lg font-semibold text-text">
              キーボードショートカット
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-hover transition-colors"
          >
            <IconX size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-text-secondary mb-6">
            以下のキーボードショートカットを使用してNatterをより効率的に操作できます。
          </p>

          {Object.entries(groupedShortcuts).map(
            ([category, categoryShortcuts]) => (
              <div key={category} className="mb-6">
                <h3 className="text-base font-semibold text-text mb-3 border-b border-border pb-2">
                  {category}
                </h3>
                <div className="space-y-3">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-text-secondary">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 bg-surface-variant border border-border rounded text-xs font-mono text-text">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}

          <div className="mt-6 p-4 bg-surface-variant rounded-lg">
            <p className="text-sm text-text-muted">
              <strong>ヒント:</strong>{" "}
              入力フィールドやモーダルが開いている時は、ショートカットは無効になります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelpModal;
