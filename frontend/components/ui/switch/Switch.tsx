"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SwitchProps } from "./switch.types";

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, label, ...props }, ref) => {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-4">
        {label && (
          <span className="text-sm font-medium text-obsidian">
            {label}
          </span>
        )}

        <span
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            checked ? "bg-obsidian" : "bg-gray-300",
            className
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="sr-only"
            {...props}
          />

          <span
            className={cn(
              "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              checked && "translate-x-5"
            )}
          />
        </span>
      </label>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;