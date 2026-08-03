import { cva } from "class-variance-authority";

export const checkboxVariants = cva(
  [
    "peer",
    "flex",
    "h-5",
    "w-5",
    "items-center",
    "justify-center",
    "rounded-md",
    "border",
    "transition-all",
    "duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-antique",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default:
          "border-line bg-white data-[checked=true]:bg-obsidian data-[checked=true]:border-obsidian",

        success:
          "border-green-500 data-[checked=true]:bg-green-600",

        danger:
          "border-red-500 data-[checked=true]:bg-red-600",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
);
