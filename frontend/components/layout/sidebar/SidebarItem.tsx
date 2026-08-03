"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  item: NavigationItem;
  level?: number;
}

export default function SidebarItem({
  item,
  level = 0,
}: SidebarItemProps) {
  const pathname = usePathname();

  const isActive =
    item.href === pathname ||
    (item.href &&
      pathname.startsWith(item.href + "/"));

  const Icon = item.icon;

  return (
    <Link
      href={item.href ?? "#"}
      className={cn(
        "group flex items-center justify-between rounded-xl transition-all duration-200",
        "px-3 py-2.5",
        isActive
          ? "bg-obsidian text-bone shadow-sm"
          : "text-ash hover:bg-bone-deep hover:text-obsidian"
      )}
      style={{
        paddingLeft: `${16 + level * 18}px`,
      }}
    >
      <div className="flex items-center gap-3 overflow-hidden">

        {Icon && (
          <Icon
            size={18}
            className="shrink-0"
          />
        )}

        <span className="truncate text-sm font-medium">
          {item.title}
        </span>

      </div>

      {item.badge && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            isActive
              ? "bg-white/20 text-white"
              : "bg-antique/10 text-antique"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}