"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function WidgetFooter({
  children,
}: Props) {
  return (
    <div className="border-t border-border px-6 py-4">
      {children}
    </div>
  );
}