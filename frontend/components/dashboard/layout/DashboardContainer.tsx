"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Page body column for the advisor dashboard.
 *
 * Spacing comes from `.shell-body` (centred, narrower than the chrome, with
 * its own gutter and vertical rhythm) so the body never shares the header's
 * scale. Rendered as a div — the dashboard layout already provides <main>.
 */
export default function DashboardContainer({
  children,
  className,
}: DashboardContainerProps) {
  return (
    <div className={cn("shell-body space-y-10 lg:space-y-12", className)}>
      {children}
    </div>
  );
}