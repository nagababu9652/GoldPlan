"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";
import { dropdownItemVariants } from "./dropdown.variants";

interface Props
  extends React.ComponentPropsWithoutRef<typeof DropdownMenu.Item> {
  inset?: boolean;
  variant?: "default" | "danger";
  className?: string;
}

const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Item>,
  Props
>(
  (
    {
      className,
      inset,
      variant = "default",
      ...props
    },
    ref
  ) => (
    <DropdownMenu.Item
      ref={ref}
      className={cn(
        dropdownItemVariants({ variant }),
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
);

DropdownItem.displayName = "DropdownItem";

export default DropdownItem;