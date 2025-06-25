"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { useRouter, redirect } from "next/navigation";

import TimeLine from "@/components/TimeLine";

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);
  if (status === "loading") {
    return (
      <BaseLayout>
        ここがスケルトン
      </BaseLayout>
    )
  }
  if (!session) {
    return null;
  }
  return (
    <BaseLayout>
      <TimeLine />
    </BaseLayout>
  );
};

export default Home;
