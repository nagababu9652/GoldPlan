"use client";

import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function WidgetActions({
  children,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      {children}
    </div>
  );
}