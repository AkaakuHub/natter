"use client";

import React from "react";
import { IconPlus } from "@tabler/icons-react";
import { ui } from "@/styles/ui";

interface CreatePostButtonProps {
  onClick: () => void;
}

const CreatePostButton: React.FC<CreatePostButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`${ui.button.floating} fixed bottom-20 right-4 z-40 lg:left-1/2 lg:translate-x-[90px]`}
      aria-label="新しい投稿を作成"
    >
      <IconPlus size={24} strokeWidth={2.5} />
    </button>
  );
};

export default CreatePostButton;
