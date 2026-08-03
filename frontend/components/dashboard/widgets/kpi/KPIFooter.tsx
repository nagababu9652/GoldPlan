"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function KPIFooter({
  children,
}: Props) {
  return (
    <div className="mt-5 border-t border-line pt-3 text-sm text-muted-foreground">
      {children}
    </div>
  );
}