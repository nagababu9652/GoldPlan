"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ClientLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export default function ClientLayout({
  children,
  sidebar,
  className,
}: ClientLayoutProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        "grid-cols-1",
        "xl:grid-cols-[320px_1fr]",
        className
      )}
    >
      {sidebar && (
        <aside className="space-y-6">
          {sidebar}
        </aside>
      )}

      <main className="min-w-0 space-y-6">
        {children}
      </main>
    </div>
  );
}