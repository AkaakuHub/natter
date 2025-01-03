import React from "react";

import { nextAuthOptions } from "@/utils/next-auth-options";
import { getServerSession } from "next-auth/next";
import BaseLayout from "@/components/BaseLayout";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <BaseLayout session={session} />
    </>
  );
}

export default Home;
