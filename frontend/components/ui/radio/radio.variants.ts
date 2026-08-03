import { cva } from "class-variance-authority";

export const radioVariants = cva(
  [
    "flex",
    "h-5",
    "w-5",
    "items-center",
    "justify-center",
    "rounded-full",
    "border",
    "transition-all",
    "focus-visible:ring-2",
    "focus-visible:ring-antique",
  ],
  {
    variants: {
      variant: {
        default:
          "border-line bg-white data-[checked=true]:border-obsidian",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
);