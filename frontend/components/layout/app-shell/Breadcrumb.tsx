"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { navigation, NavigationItem } from "@/config/navigation";

interface Crumb {
  title: string;
  href?: string;
}

function findBreadcrumbs(
  items: NavigationItem[],
  pathname: string,
  parents: Crumb[] = []
): Crumb[] | null {
  for (const item of items) {
    const current = [
      ...parents,
      {
        title: item.title,
        href: item.href,
      },
    ];

    if (item.href === pathname) {
      return current;
    }

    if (item.children) {
      const result = findBreadcrumbs(
        item.children,
        pathname,
        current
      );

      if (result) return result;
    }
  }

  return null;
}

export default function Breadcrumb() {
  const pathname = usePathname();

  const crumbs = findBreadcrumbs(navigation, pathname);

  if (!crumbs) return null;

  return (
    <nav
      className="mb-6 flex items-center gap-2 text-sm"
      aria-label="Breadcrumb"
    >
      <Link
        href="/dashboard"
        className="text-ash hover:text-obsidian transition"
      >
        <Home size={16} />
      </Link>

      {crumbs.map((crumb, index) => {
        const last = index === crumbs.length - 1;

        return (
          <div
            key={crumb.title}
            className="flex items-center gap-2"
          >
            <ChevronRight
              size={14}
              className="text-ash-light"
            />

            {last || !crumb.href ? (
              <span className="font-medium text-obsidian">
                {crumb.title}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-ash hover:text-obsidian transition"
              >
                {crumb.title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}