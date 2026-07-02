import React from "react";
import Image from "next/image";
import { User } from "@/api";
import { avatarImageUrl } from "@/utils/avatarImage";

interface UserAvatarProps {
  user?: User | null;
}

const UserAvatar = ({ user }: UserAvatarProps) => {
  return (
    <div className="relative">
      <Image
        src={avatarImageUrl(user?.image)}
        alt={user?.name || "User"}
        className="w-12 h-12 rounded-full"
        width={48}
        height={48}
      />
    </div>
  );
};

export default UserAvatar;
