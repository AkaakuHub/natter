import React from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface PostTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  characterLimit?: number;
  disabled?: boolean;
  onSubmit?: () => void;
}

const PostTextArea = ({
  value,
  onChange,
  placeholder = "今何してる？",
  characterLimit = 280,
  disabled = false,
  onSubmit,
}: PostTextAreaProps) => {
  const { handleKeyDown } = useKeyboardShortcuts({ onSubmit });

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full resize-none border-none outline-none text-xl placeholder-gray-400 bg-transparent leading-relaxed font-medium focus:placeholder-gray-300 transition-all duration-300"
      rows={3}
      maxLength={characterLimit}
      disabled={disabled}
    />
  );
};

export default PostTextArea;
