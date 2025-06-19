import React, { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { getDominantColor } from "@/utils/colorUtils";
import { ExtendedSession } from "@/types";

interface ProfileHeaderProps {
  session: ExtendedSession;
}

const ProfileHeader = ({ session }: ProfileHeaderProps) => {
  const [bgColor, setBgColor] = useState("#64748b");
  const [applyAnimation, setApplyAnimation] = useState(false);

  useEffect(() => {
    const image = session.user?.image ?? "/no_avatar_image_128x128.png";
    getDominantColor(image).then((color) => {
      setBgColor(color);
      setApplyAnimation(true);
    });
  }, [session.user?.image]);

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
          src={session.user?.image ?? "/no_avatar_image_128x128.png"}
          alt={session.user?.name ?? "no_avatar"}
          width={96}
          height={96}
          className="rounded-full border-4 border-white absolute -top-12"
        />
        <div className="mt-12 p-2">
          <div className="text-2xl font-bold text-center">{session.user?.name ?? "No Name"}</div>
          <div className="text-sm text-gray-500">@{session.user?.id ?? "no_id"}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;