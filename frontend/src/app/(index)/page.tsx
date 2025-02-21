"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { useRouter, redirect } from "next/navigation";
import { ExtendedSession } from "@/types";
import TimeLine from "@/components/TimeLine";

const Home = () => {
  return (
    <BaseLayout >
      <TimeLine />
    </BaseLayout>
  );
};

export default Home;
