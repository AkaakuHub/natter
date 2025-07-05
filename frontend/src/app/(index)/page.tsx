"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import TwitterLikeLayout from "@/components/layout/TwitterLikeLayout";
import { NavigationStackProvider } from "@/components/providers/NavigationStackProvider";
import { redirect } from "next/navigation";

const Home = () => {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <NavigationStackProvider>
      <TwitterLikeLayout />
    </NavigationStackProvider>
  );
};

export default Home;
