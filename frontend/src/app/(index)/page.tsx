"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { redirect } from "next/navigation";
import TimeLine from "@/components/TimeLine";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Home = () => {
  const { status } = useSession();
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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