import React, { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { getDominantColor } from "@/utils/colorUtils";
import { ExtendedSession } from "@/types";
import { getUserById } from "@/data/mockData";

interface ProfileHeaderProps {
  session: ExtendedSession;
  userId?: number;
}

const ProfileHeader = ({ session, userId }: ProfileHeaderProps) => {
  const [bgColor, setBgColor] = useState("#64748b");
  const [applyAnimation, setApplyAnimation] = useState(false);

  const targetUser = userId ? getUserById(userId) : null;
  const displayUser = targetUser || session.user;

  useEffect(() => {
    const image = displayUser?.image ?? "/no_avatar_image_128x128.png";
    getDominantColor(image).then((color) => {
      setBgColor(color);
      setApplyAnimation(true);
    });
  }, [displayUser?.image]);

  return (
    <div>
      <div
        className={clsx("h-16 w-full flex items-center justify-center ease-in-out duration-500", applyAnimation ? "animate-fade-in" : "")}
        style={{
          backgroundColor: bgColor,
        }}
      />
      <div className="relative w-full flex flex-row items-center justify-center gap-2">
        <Image
          src={displayUser?.image ?? "/no_avatar_image_128x128.png"}
          alt={displayUser?.name ?? "no_avatar"}
          width={96}
          height={96}
          className="rounded-full border-4 border-white absolute -top-12"
        />
        <div className="mt-12 p-2">
          <div className="text-2xl font-bold text-center">{displayUser?.name ?? "No Name"}</div>
          <div className="text-sm text-gray-500">@{displayUser?.id ?? "no_id"}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;