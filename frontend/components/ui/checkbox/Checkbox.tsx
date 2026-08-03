"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { checkboxVariants } from "./checkbox.variants";
import { CheckboxProps } from "./checkbox.types";

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, label, helperText, checked, ...props }, ref) => {
    return (
      <label className="flex cursor-pointer items-start gap-3">
        <span
          className={cn(
            checkboxVariants({ variant }),
            checked && "bg-obsidian border-obsidian text-white",
            className
          )}
          data-checked={checked}
        >
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="sr-only"
            {...props}
          />

          {checked && <Check className="h-3.5 w-3.5" />}
        </span>

        {(label || helperText) && (
          <div>
            {label && (
              <p className="text-sm font-medium text-obsidian">
                {label}
              </p>
            )}

            {helperText && (
              <p className="text-xs text-ash">
                {helperText}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;