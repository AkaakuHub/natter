import { useEffect, useRef } from "react";

// グローバルなモーダル状態管理
class ModalStateManager {
  private static instance: ModalStateManager;
  private openModals = new Set<string>();
  private lastClosedTime = 0;
  private readonly COOLDOWN_PERIOD = 500; // 500msの猶予期間

  static getInstance(): ModalStateManager {
    if (!ModalStateManager.instance) {
      ModalStateManager.instance = new ModalStateManager();
    }
    return ModalStateManager.instance;
  }

  openModal(id: string) {
    this.openModals.add(id);
  }

  closeModal(id: string) {
    this.openModals.delete(id);
    this.lastClosedTime = Date.now();
  }

  hasOpenModals(): boolean {
    return this.openModals.size > 0;
  }

  wasRecentlyClosed(): boolean {
    const timeSinceClose = Date.now() - this.lastClosedTime;
    const isInCooldown = timeSinceClose < this.COOLDOWN_PERIOD;
    return isInCooldown;
  }

  getOpenModalCount(): number {
    return this.openModals.size;
  }
}

export const useModalState = (modalId: string, isOpen: boolean) => {
  const manager = ModalStateManager.getInstance();
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      manager.openModal(modalId);
      wasOpen.current = true;
    } else if (!isOpen && wasOpen.current) {
      manager.closeModal(modalId);
      wasOpen.current = false;
    }

    return () => {
      if (wasOpen.current) {
        manager.closeModal(modalId);
        wasOpen.current = false;
      }
    };
  }, [isOpen, modalId, manager]);

  return {
    hasOpenModals: () => manager.hasOpenModals(),
    wasRecentlyClosed: () => manager.wasRecentlyClosed(),
    getOpenModalCount: () => manager.getOpenModalCount(),
  };
};
