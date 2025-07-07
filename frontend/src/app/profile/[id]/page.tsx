"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { redirect, useParams } from "next/navigation";
import { ExtendedSession } from "@/types";
import ProfileComponent from "@/components/Profile";

const ProfileById = () => {
  const { data: session, status } = useSession();
  const params = useParams<{ id: string }>();
  const userId = params.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </BaseLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <BaseLayout>
      <ProfileComponent session={session as ExtendedSession} userId={userId} />
    </BaseLayout>
  );
};

export default ProfileById;