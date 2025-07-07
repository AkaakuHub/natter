import React from "react";
import Image from "next/image";

interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    image: string;
  };
  onUserClick: () => void;
}

const UserAvatar = ({ user, onUserClick }: UserAvatarProps) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onUserClick();
      }}
      className="flex-shrink-0 self-start"
    >
      <Image
        src={user?.image || "no_avatar_image_128x128.png"}
        alt={user?.name || "User"}
        className="w-12 h-12 rounded-full border-2 border-border-muted hover:border-interactive-bg transition-colors duration-200 cursor-pointer"
        width={48}
        height={48}
      />
    </button>
  );
};

export default UserAvatar;
