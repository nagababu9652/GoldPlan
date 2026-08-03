"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";
import { dropdownContentVariants } from "./dropdown.variants";

const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        dropdownContentVariants(),
        className
      )}
      {...props}
    />
  </DropdownMenu.Portal>
));

DropdownContent.displayName = "DropdownContent";

export default DropdownContent;