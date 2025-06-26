"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigationStack } from '@/hooks/useNavigationStack';

// NavigationStackコンテキストを作成
const NavigationStackContext = createContext<ReturnType<typeof useNavigationStack> | null>(null);

// NavigationStackProviderコンポーネント
export const NavigationStackProvider = ({ children }: { children: ReactNode }) => {
  const navigationStack = useNavigationStack();
  return (
    <NavigationStackContext.Provider value={navigationStack}>
      {children}
    </NavigationStackContext.Provider>
  );
};

// useNavigationStackContextフック
export const useNavigationStackContext = () => {
  const context = useContext(NavigationStackContext);
  return context;
};