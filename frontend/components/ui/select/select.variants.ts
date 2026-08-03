import { cva } from "class-variance-authority";

export const selectVariants = cva(
  [
    "flex",
    "h-10",
    "w-full",
    "items-center",
    "justify-between",
    "rounded-xl",
    "border",
    "border-line",
    "bg-white",
    "px-4",
    "text-sm",
    "transition-colors",
    "placeholder:text-ash",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-antique",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-9 text-xs",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },

      state: {
        default: "",
        success: "border-green-500",
        error: "border-red-500",
      },
    },

    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
);