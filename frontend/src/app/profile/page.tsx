"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { useRouter, redirect } from "next/navigation";
import { ExtendedSession } from "@/types";
import ProfileComponent from "@/components/Profile";

const Profile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);
  if (status === "loading") {
    return (
      <BaseLayout session={null}>
        ここがスケルトン
      </BaseLayout>
    )
  }
  if (!session) {
    return null;
  }
  return (
    <BaseLayout session={session as ExtendedSession}>
      <ProfileComponent session={session as ExtendedSession} />
    </BaseLayout>
  );
};

export default Profile;
