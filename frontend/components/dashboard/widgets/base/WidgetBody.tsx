"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;

  className?: string;

  noPadding?: boolean;
}

export default function WidgetBody({
  children,
  className,
  noPadding = false,
}: Props) {
  return (
    <div
      className={cn(
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}