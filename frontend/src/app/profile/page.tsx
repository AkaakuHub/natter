"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { useRouter, redirect, useSearchParams } from "next/navigation";
import { ExtendedSession } from "@/types";
import ProfileComponent from "@/components/Profile";

const Profile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
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
      <ProfileComponent session={session as ExtendedSession} userId={userId ? parseInt(userId) : undefined} />
    </BaseLayout>
  );
};

export default Profile;
