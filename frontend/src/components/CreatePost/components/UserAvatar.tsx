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
        className="w-12 h-12 rounded-full"
        width={48}
        height={48}
      />
    </div>
  );
};

export default UserAvatar;
