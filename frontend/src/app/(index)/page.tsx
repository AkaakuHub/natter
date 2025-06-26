"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import SimpleLayout from "@/components/layout/SimpleLayout";
import { redirect } from "next/navigation";
import TimeLine from "@/components/TimeLine";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Home = () => {
  const { data: session, status } = useSession();
  const { currentUser } = useCurrentUser();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);
  
  if (status === "loading") {
    return (
      <SimpleLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </SimpleLayout>
    )
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <SimpleLayout>
      <TimeLine currentUser={currentUser} />
    </SimpleLayout>
  );
};

export default Home;
