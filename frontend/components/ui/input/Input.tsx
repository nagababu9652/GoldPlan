"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { inputVariants } from "./input.variants";
import { InputProps } from "./input.types";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      state,
      size,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">

        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ash">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={cn(
            inputVariants({
              state,
              size,
            }),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ash">
            {rightIcon}
          </div>
        )}

      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;