"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const DropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenu.Label
    ref={ref}
    className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ash ${className ?? ""}`}
    {...props}
  />
));

DropdownLabel.displayName = "DropdownLabel";

export default DropdownLabel;