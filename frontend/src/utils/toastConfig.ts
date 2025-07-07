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

export const toastColors = {
  success:
    "bg-gradient-to-r from-success to-success-hover text-text-inverse shadow-success/30",
  error:
    "bg-gradient-to-r from-error to-error-hover text-text-inverse shadow-error/30",
  warning:
    "bg-gradient-to-r from-warning to-warning-hover text-text-inverse shadow-warning/30",
  info: "bg-gradient-to-r from-interactive to-interactive-hover text-text-inverse shadow-interactive/30",
};
