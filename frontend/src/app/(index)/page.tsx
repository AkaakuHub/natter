"use client";

import React from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/BaseLayout";
import { useRouter } from "next/navigation";

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    // セッション確認中のローディング表示
    return <div>Loading...</div>;
  }

  if (!session) {
    // 未認証の場合（リダイレクト処理後）
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
