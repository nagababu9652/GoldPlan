import { cva } from "class-variance-authority";

export const avatarVariants = cva(
  [
    "relative",
    "inline-flex",
    "shrink-0",
    "overflow-hidden",
    "bg-bone-deep",
    "font-semibold",
    "text-obsidian",
    "select-none",
  ],
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },

      shape: {
        circle: "rounded-full",
        rounded: "rounded-xl",
        square: "rounded-md",
      },

      bordered: {
        true: "ring-2 ring-white shadow-sm",
        false: "",
      },
    },

    defaultVariants: {
      size: "md",
      shape: "circle",
      bordered: false,
    },
  }
);