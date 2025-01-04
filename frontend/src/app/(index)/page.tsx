"use client";

import React from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/BaseLayout";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);
  if (status === "loading") {
    return <div>TL ページ is Loading...</div>;
  }
  if (!session) {
    return null;
  }

  return (
    <BaseLayout session={session}>
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-400">

      </div>
    </BaseLayout>
  );
};

export default Home;
