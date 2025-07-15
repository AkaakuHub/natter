import React, { useEffect, useRef } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAppState } from "@/contexts/AppStateContext";
import { calculateEffectiveLength } from "@/utils/textUtils";

interface PostTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  characterLimit?: number;
  disabled?: boolean;
  onSubmit?: () => void;
  autoFocus?: boolean;
}

const PostTextArea = ({
  value,
  onChange,
  placeholder = "今何してる？",
  characterLimit = 280,
  disabled = false,
  onSubmit,
  autoFocus = false,
}: PostTextAreaProps) => {
  const { handleKeyDown } = useKeyboardShortcuts({ onSubmit });
  const { setInputFocused } = useAppState();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    const handleFocus = () => setInputFocused(true);
    const handleBlur = () => setInputFocused(false);

    element.addEventListener("focus", handleFocus);
    element.addEventListener("blur", handleBlur);

    return () => {
      element.removeEventListener("focus", handleFocus);
      element.removeEventListener("blur", handleBlur);
    };
  }, [setInputFocused]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // 少し遅延を入れてフォーカスを設定（モーダルアニメーション完了後）
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={inputRef}
      value={value}
      onChange={(e) => {
        let newValue = e.target.value;

        // 問題のあるゼロ幅文字を削除
        newValue = newValue.replace(/[\u200B\u2060\uFEFF]/g, "");

        // URL特殊カウントを考慮した文字数制限チェック
        const effectiveLength = calculateEffectiveLength(newValue);
        if (effectiveLength <= characterLimit) {
          onChange(newValue);
        }
        // 制限を超えた場合は更新しない（入力を拒否）
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full resize-none border-none outline-none text-xl placeholder-gray-400 bg-transparent leading-relaxed font-medium focus:placeholder-gray-300 transition-all duration-300"
      rows={3}
      disabled={disabled}
    />
  );
};

export default PostTextArea;
