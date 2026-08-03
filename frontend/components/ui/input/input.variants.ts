import { cva } from "class-variance-authority";

export const inputVariants = cva(
  [
    "flex",
    "w-full",
    "rounded-xl",
    "border",
    "bg-white",
    "px-4",
    "py-2.5",
    "text-sm",
    "transition-all",
    "placeholder:text-ash",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-antique",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
  ],
  {
    variants: {
      state: {
        default: "border-line",
        error: "border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
      },

      size: {
        sm: "h-9",
        md: "h-10",
        lg: "h-12",
      },
    },

    defaultVariants: {
      state: "default",
      size: "md",
    },
  }
);