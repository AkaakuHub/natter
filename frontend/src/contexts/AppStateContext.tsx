"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AppStateContextType {
  isModalOpen: boolean;
  isInputFocused: boolean;
  setModalOpen: (open: boolean) => void;
  setInputFocused: (focused: boolean) => void;
  openedModals: Set<string>;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInputFocused, setInputFocused] = useState(false);
  const [openedModals, setOpenedModals] = useState<Set<string>>(new Set());

  const openModal = useCallback((modalId: string) => {
    setOpenedModals((prev) => {
      const newSet = new Set(prev);
      newSet.add(modalId);
      return newSet;
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setOpenedModals((prev) => {
      const newSet = new Set(prev);
      newSet.delete(modalId);
      setModalOpen(newSet.size > 0);
      return newSet;
    });
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        isModalOpen,
        isInputFocused,
        setModalOpen,
        setInputFocused,
        openedModals,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
