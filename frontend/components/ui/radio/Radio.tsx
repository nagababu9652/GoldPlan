"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { radioVariants } from "./radio.variants";
import { RadioProps } from "./radio.types";

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, checked, label, variant, ...props }, ref) => {
    return (
      <label className="flex cursor-pointer items-center gap-3">
        <span
          className={cn(radioVariants({ variant }), className)}
          data-checked={checked}
        >
          <input
            ref={ref}
            type="radio"
            checked={checked}
            className="sr-only"
            {...props}
          />

          {checked && (
            <span className="h-2.5 w-2.5 rounded-full bg-obsidian" />
          )}
        </span>

        {label && (
          <span className="text-sm font-medium">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Radio.displayName = "Radio";

export default Radio;