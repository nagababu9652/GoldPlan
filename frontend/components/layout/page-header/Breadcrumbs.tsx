"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BreadcrumbItem } from "./page-header.types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({
  items,
}: BreadcrumbsProps) {
  return (
    <nav className="mb-2 flex items-center text-sm text-ash">
      {items.map((item, index) => (
        <div
          key={item.label}
          className="flex items-center"
        >
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-obsidian transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-obsidian">
              {item.label}
            </span>
          )}

          {index < items.length - 1 && (
            <ChevronRight className="mx-2 h-4 w-4" />
          )}
        </div>
      ))}
    </nav>
  );
}