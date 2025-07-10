"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TimeLine from "@/components/TimeLine";
import { User } from "@/api";

const HomeView = () => {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      const user: User = {
        id: session.user.id as string,
        name: session.user.name || "Unknown User",
        image: session.user.image || undefined,
        twitterId: session.user.id as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  }, [session]);

  return <TimeLine currentUser={currentUser} />;
};

export default HomeView;
