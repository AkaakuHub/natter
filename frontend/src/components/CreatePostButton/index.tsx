"use client";

import React from "react";
import { IconPlus } from "@tabler/icons-react";

interface CreatePostButtonProps {
  onClick: () => void;
}

const CreatePostButton: React.FC<CreatePostButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 w-14 h-14 bg-interactive hover:bg-interactive-hover text-text-inverse rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
      aria-label="新しい投稿を作成"
    >
      <IconPlus size={24} strokeWidth={2.5} />
    </button>
  );
};

export default CreatePostButton;
