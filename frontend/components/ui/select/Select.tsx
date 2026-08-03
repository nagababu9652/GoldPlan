"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { selectVariants } from "./select.variants";
import { SelectProps } from "./select.types";

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      size,
      state,
      options,
      placeholder = "Select an option",
      error,
      ...props
    },
    ref
  ) => {
    const currentState = error ? "error" : state;

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            selectVariants({
              size,
              state: currentState,
            }),
            "appearance-none pr-10",
            className
          )}
          {...props}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ash"
        />
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;