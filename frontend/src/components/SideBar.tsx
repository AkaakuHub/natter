"use client";

import Image from "next/image";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";

const SideBar = ({ session }: { session: Session }) => {
  return (
    <div className="w-full h-full bg-slate-300 border-r border-gray-200  flex flex-col items-center justify-center">
      <Image
        src={session.user?.image ?? "no_avatar_image_128x128.png"}
        alt={session.user?.name ?? "no_avatar_image_128x128.png"}
        width={32}
        height={32}
        className="rounded-full"
      />
      <button
        onClick={() => signOut()}
        className="rounded-lg bg-blue-500 px-4 py-[7px] text-white hover:bg-slate-600"
      >
        ログアウト
      </button>
    </div>
  );
};

export default SideBar;
