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
    "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30",
  error:
    "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/30",
  warning:
    "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/30",
  info: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/30",
};
