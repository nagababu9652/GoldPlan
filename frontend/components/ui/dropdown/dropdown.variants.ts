import { cva } from "class-variance-authority";

export const dropdownContentVariants = cva(
  [
    "z-50",
    "min-w-[220px]",
    "overflow-hidden",
    "rounded-xl",
    "border",
    "border-line",
    "bg-white",
    "p-1.5",
    "shadow-xl",
    "animate-in",
    "fade-in-0",
    "zoom-in-95",
  ]
);

export const dropdownItemVariants = cva(
  [
    "flex",
    "cursor-pointer",
    "select-none",
    "items-center",
    "gap-3",
    "rounded-lg",
    "px-3",
    "py-2",
    "text-sm",
    "outline-none",
    "transition-colors",
    "hover:bg-bone-deep",
    "focus:bg-bone-deep",
  ],
  {
    variants: {
      variant: {
        default: "text-obsidian",
        danger: "text-red-600 hover:bg-red-50 focus:bg-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);