"use client";

import React from "react";
import { createContext, type ReactNode, useContext } from "react";
import { createStore, type StoreApi, useStore } from "zustand";

interface LayoutState {
  componentNames: string[];
}

interface LayoutAction {
  pop: () => void;
  push: (name: string) => void;
}

export type LayoutStore = LayoutState & LayoutAction;

const createLayoutStore = (): StoreApi<LayoutStore> =>
  createStore<LayoutStore>((set) => ({
    componentNames: [],
    pop: () =>
      set((state) => ({
        componentNames: state.componentNames.slice(0, -1),
      })),
    push: (name) =>
      set((state) => ({
        componentNames: [...state.componentNames, name],
      })),
  }));

const LayoutContext = createContext<ReturnType<
  typeof createLayoutStore
> | null>(null);

export const LayoutProvider = ({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element => {
  const store = createLayoutStore();
  return (
    <LayoutContext.Provider value={store}>{children}</LayoutContext.Provider>
  );
};

export const useLayoutStore = (): LayoutStore => {
  const store = useContext(LayoutContext);
  if (store === null) {
    throw new Error("no provider");
  }
  return useStore(store);
};