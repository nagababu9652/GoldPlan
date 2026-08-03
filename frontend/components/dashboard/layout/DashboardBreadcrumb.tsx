"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function DashboardBreadcrumb({
  items,
}: DashboardBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">

      {items.map((item, index) => (
        <div
          key={item.label}
          className="flex items-center gap-2"
        >
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">
              {item.label}
            </span>
          )}

          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      ))}

    </nav>
  );
}