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
    if (status === "unauthenticated" || status === "loading") {
      redirect("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <BaseLayout session={session}>
      <div>
        <h1>Home</h1>
        <p>Welcome to the home page</p>
      </div>
    </BaseLayout>
  );
};

export default Home;
