import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-full",
    "border",
    "font-medium",
    "transition-colors",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-obsidian text-white",

        secondary:
          "border-transparent bg-bone-deep text-obsidian",

        outline:
          "border-line bg-white text-obsidian",

        success:
          "border-green-200 bg-green-50 text-green-700",

        warning:
          "border-yellow-200 bg-yellow-50 text-yellow-700",

        danger:
          "border-red-200 bg-red-50 text-red-700",

        info:
          "border-blue-200 bg-blue-50 text-blue-700",

        purple:
          "border-purple-200 bg-purple-50 text-purple-700",
      },

      size: {
        sm: "px-2 py-0.5 text-xs",

        md: "px-2.5 py-1 text-sm",

        lg: "px-3 py-1.5 text-sm",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);