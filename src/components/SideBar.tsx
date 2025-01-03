"use client";

import Image from "next/image";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";

const SideBar = ({ session }: { session: Session }) => {
  return (
    <div className="w-[200px] border-r border-gray-200 h-screen flex flex-col items-center justify-center">
      <Image
        src={session.user?.image ?? ""}
        alt={session.user?.name ?? ""}
        width={40}
        height={40}
        className="rounded-full"
      />
      <button
        onClick={() => signOut()}
        className="rounded-lg bg-blue-500 px-4 py-[7px] text-white hover:bg-gray-600"
      >
        ログアウト
      </button>
    </div>
  );
};

export default SideBar;