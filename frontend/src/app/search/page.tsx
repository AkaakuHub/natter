"use client";

import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import BaseLayout from "@/components/layout/BaseLayout";
import SearchComponent from "@/components/Search";

const SearchPage = () => {
  const { currentUser } = useCurrentUser();

  return (
    <BaseLayout>
      <SearchComponent currentUser={currentUser} />
    </BaseLayout>
  );
};

export default SearchPage;
