import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";

export type ToastType = "success" | "error" | "warning" | "info";

export const toastIcons = {
  success: IconCheck,
  error: IconX,
  warning: IconAlertCircle,
  info: IconInfoCircle,
};

export const toastContainerColors: Record<ToastType, string> = {
  success: "border-success/40",
  error: "border-error/40",
  warning: "border-warning/40",
  info: "border-interactive/40",
};

export const toastIconBackground: Record<ToastType, string> = {
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  warning: "bg-warning/10 text-warning",
  info: "bg-interactive/10 text-interactive",
};
