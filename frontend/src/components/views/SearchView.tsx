"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SearchComponent from "@/components/Search";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const SearchView = () => {
  const { status } = useSession();
  const { currentUser } = useCurrentUser();

  // 認証チェック中はローディング表示
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // 未認証の場合は何も表示しない（HybridSPAAuthがリダイレクトを処理）
  if (status === "unauthenticated") {
    return null;
  }

  return <SearchComponent currentUser={currentUser} />;
};

export default SearchView;
