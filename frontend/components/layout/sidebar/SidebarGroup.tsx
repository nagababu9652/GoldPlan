"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { NavigationItem } from "@/config/navigation";
import SidebarItem from "./SidebarItem";

interface SidebarGroupProps {
  item: NavigationItem;
  level?: number;
}

export default function SidebarGroup({
  item,
  level = 0,
}: SidebarGroupProps) {
  const pathname = usePathname();

  const hasChildren =
    !!item.children && item.children.length > 0;

  const containsActiveChild = useMemo(() => {
    if (!hasChildren) return false;

    const check = (items: NavigationItem[]): boolean => {
      return items.some((child) => {
        if (child.href === pathname) return true;

        if (child.children) {
          return check(child.children);
        }

        return false;
      });
    };

    return check(item.children!);
  }, [pathname, item.children, hasChildren]);

  const [open, setOpen] = useState(containsActiveChild);

  if (!hasChildren) {
    return (
      <SidebarItem
        item={item}
        level={level}
      />
    );
  }

  return (
    <div className="space-y-1">

      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-bone-deep"
      >
        <div className="flex items-center gap-3">

          {item.icon && (
            <item.icon
              size={18}
              className="text-ash"
            />
          )}

          <span className="font-medium">
            {item.title}
          </span>

        </div>

        {open ? (
          <ChevronDown
            size={16}
            className="text-ash"
          />
        ) : (
          <ChevronRight
            size={16}
            className="text-ash"
          />
        )}
      </button>

      {open && (
        <div
          className="space-y-1 border-l border-line ml-4 pl-3"
        >
          {item.children!.map((child) => (
            <SidebarGroup
              key={child.id}
              item={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}