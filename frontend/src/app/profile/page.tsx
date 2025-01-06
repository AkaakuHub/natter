import React from "react";
import BaseLayout from "@/components/BaseLayout";
import ProfileInner from "./_components/ProfileInner";

export default function Profile() {
  return (
    <BaseLayout>
      <div className="flex flex-col items-center justify-center gap-8 bg-slate-700 h-full">
        <ProfileInner/>
      </div>
    </BaseLayout>

  )
}
