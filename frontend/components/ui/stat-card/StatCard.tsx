"use client";

import * as React from "react";

import { Card } from "@/app/advisor-dashboard/components/ui/card";
import { cn } from "@/lib/utils";

const StatCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
      className
    )}
    {...props}
  />
));

StatCard.displayName = "StatCard";

export default StatCard;