import React from "react";
import Image from "next/image";
import { User } from "@/api";

interface UserAvatarProps {
  user?: User | null;
}

const UserAvatar = ({ user }: UserAvatarProps) => {
  return (
    <div className="relative">
      <Image
        src={user?.image || "/no_avatar_image_128x128.png"}
        alt={user?.name || "User"}
        className="w-12 h-12 rounded-full ring-2 ring-gray-100 hover:ring-primary/30 transition-all duration-300"
        width={48}
        height={48}
      />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
    </div>
  );
};

export default UserAvatar;