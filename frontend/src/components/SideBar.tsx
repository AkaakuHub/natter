"use client";

import Image from "next/image";
import type { ExtendedSession } from "@/types";
import { signOut } from "next-auth/react";
import { IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";

const SideBar = ({ session }: { session: ExtendedSession }) => {
  return (
    <div className="h-full bg-slate-200 border-r border-gray-200 flex flex-col p-4 gap-4">
      <div className="flex flex-row items-center gap-4 mb-8">
        <Image
          src={session.user?.image ?? "/no_avatar_image_128x128.png"}
          alt={session.user?.name ?? "no_avatar"}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-lg font-bold">
            {session.user?.name ?? "No Name"}
          </span>
          <span className="text-sm text-gray-500">
            @{session.user?.id ?? "no_id"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Link
          className="w-full text-left px-4 py-2 text-lg font-semibold bg-white border rounded-md hover:bg-gray-50 flex items-center"
          href={`/profile/${session.user?.id}`}
        >
          <IconUser className="w-6 h-6 mr-2" />
          <span>プロフィール</span>
        </Link>
        <button
          className="w-full text-left px-4 py-2 text-lg font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
          onClick={() => signOut()}
        >
          <IconLogout className="w-6 h-6 mr-2" />
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;
