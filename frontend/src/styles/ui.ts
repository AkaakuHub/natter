import { cn } from "@/lib/utils";

const controlBase =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50";

export const ui = {
  surface: {
    panel: "bg-surface border border-border-strong rounded-lg shadow-sm",
    modal: "bg-surface border border-border-strong rounded-xl shadow-popover",
    menu: "bg-surface border border-border-strong rounded-lg shadow-popover overflow-hidden",
    subtle: "bg-surface-variant border border-border rounded-md",
    media: "overflow-hidden rounded-lg border border-border bg-surface",
  },
  button: {
    primary: cn(
      controlBase,
      "bg-interactive px-5 py-2 text-text-inverse hover:bg-interactive-hover active:bg-interactive-active",
    ),
    secondary: cn(
      controlBase,
      "border border-border bg-surface px-5 py-2 text-text hover:bg-surface-hover active:bg-surface-pressed",
    ),
    danger: cn(
      controlBase,
      "bg-error px-5 py-2 text-text-inverse hover:bg-error-hover active:bg-error-hover",
    ),
    action: cn(
      controlBase,
      "px-3 py-2 text-text-muted hover:bg-surface-hover hover:text-text active:bg-surface-pressed",
    ),
    icon: cn(
      controlBase,
      "h-9 w-9 p-0 text-text-muted hover:bg-surface-hover hover:text-text active:bg-surface-pressed",
    ),
    overlayIcon: cn(
      controlBase,
      "h-10 w-10 rounded-lg bg-overlay p-0 text-text-inverse hover:bg-overlay/90 hover:text-text-inverse",
    ),
    floating: cn(
      controlBase,
      "h-14 w-14 rounded-lg bg-interactive p-0 text-text-inverse shadow-md hover:bg-interactive-hover active:bg-interactive-active",
    ),
  },
};
