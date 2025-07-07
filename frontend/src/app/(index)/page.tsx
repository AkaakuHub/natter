"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { redirect } from "next/navigation";
import TimeLine from "@/components/TimeLine";
import { User } from "@/api";

const Home = () => {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    // セッションから簡単にユーザー情報を作成
    if (session?.user) {
      const user: User = {
        id: session.user.id as string,
        name: session.user.name || "Unknown User",
        image: session.user.image || undefined,
        twitterId: session.user.id as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log("Setting currentUser from session:", user);
      setCurrentUser(user);
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-interactive"></div>
      </div>
    );
  }

  return (
    <BaseLayout>
      <TimeLine currentUser={currentUser} />
    </BaseLayout>
  );
};

export default Home;
