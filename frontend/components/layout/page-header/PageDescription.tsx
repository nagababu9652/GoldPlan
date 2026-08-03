"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const PageDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mt-2 max-w-3xl text-sm text-ash",
      className
    )}
    {...props}
  />
));

PageDescription.displayName = "PageDescription";

export default PageDescription;