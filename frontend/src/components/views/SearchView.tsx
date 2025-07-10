"use client";

import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SearchComponent from "@/components/Search";

const SearchView = () => {
  const { currentUser } = useCurrentUser();

  return <SearchComponent currentUser={currentUser} />;
};

export default SearchView;
