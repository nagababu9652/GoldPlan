import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "rounded-xl",
    "font-medium",
    "transition-all",
    "duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-antique",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-obsidian text-white hover:bg-antique hover:text-obsidian",

        secondary:
          "bg-bone-deep text-obsidian hover:bg-bone",

        outline:
          "border border-line bg-white hover:bg-bone",

        ghost:
          "hover:bg-bone-deep",

        destructive:
          "bg-red-600 text-white hover:bg-red-700",
      },

      size: {
        sm: "h-9 px-3 text-sm",

        md: "h-10 px-4",

        lg: "h-12 px-6 text-base",

        icon: "h-10 w-10",
      },

      fullWidth: {
        true: "w-full",

        false: "",
      },
    },

    defaultVariants: {
      variant: "primary",

      size: "md",

      fullWidth: false,
    },
  }
);