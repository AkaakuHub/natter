import { useState, useEffect, useCallback } from "react";

interface UseToastAnimationProps {
  duration: number;
  onClose: () => void;
}

interface UseToastAnimationResult {
  isVisible: boolean;
  isLeaving: boolean;
  handleClose: () => void;
}

export const useToastAnimation = ({
  duration,
  onClose,
}: UseToastAnimationProps): UseToastAnimationResult => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return {
    isVisible,
    isLeaving,
    handleClose,
  };
};
