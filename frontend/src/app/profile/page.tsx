"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MyProfile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.id) {
      // ログイン済みの場合は自分のIDを使って強制リダイレクト
      router.replace(`/profile/${session.user.id}`);
    }
  }, [status, session?.user?.id, router]);

  // ローディング中またはリダイレクト待ち
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div>Loading...</div>
    </div>
  );
};

export default MyProfile;
