"use client";

import React from "react";
import { createContext, type ReactNode, useContext } from "react";
import { createStore, type StoreApi, useStore } from "zustand";

interface ComponentInfo {
  name: string;
  extra?: string | null;
}

interface LayoutState {
  componentNames: ComponentInfo[];
}

interface LayoutAction {
  pop: () => ComponentInfo | undefined;
  push: (componentInfo: ComponentInfo) => void;
  clear: () => void;
}

export type LayoutStore = LayoutState & LayoutAction;

const createLayoutStore = (): StoreApi<LayoutStore> =>
  createStore<LayoutStore>((set, get) => ({
    componentNames: [],
    pop: () => {
      const state = get();
      const last = state.componentNames.at(-1);
      // 最後の要素を削除して新しい配列に更新する
      set((s) => ({
        componentNames: s.componentNames.slice(0, -1),
      }));
      return last;
    },
    push: (componentInfo: ComponentInfo) =>
      set((state) => ({
        componentNames: [...state.componentNames, componentInfo],
      })),
    clear: () => set({ componentNames: [] }),
  }));

const LayoutContext = createContext<ReturnType<typeof createLayoutStore> | null>(
  null
);

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