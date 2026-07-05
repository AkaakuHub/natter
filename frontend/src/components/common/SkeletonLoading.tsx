"use client";

import React from "react";
import SkeletonCard from "./SkeletonCard";

const SkeletonLoading = () => {
  return (
    <div className="w-full max-w-md mx-auto py-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
};

export default SkeletonLoading;
