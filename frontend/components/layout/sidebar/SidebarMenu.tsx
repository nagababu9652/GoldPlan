"use client";

import { navigation } from "@/config/navigation";
import SidebarGroup from "./SidebarGroup";

export default function SidebarMenu() {
  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <div className="space-y-2 px-3">
        {navigation.map((item) => (
          <SidebarGroup
            key={item.id}
            item={item}
            level={0}
          />
        ))}
      </div>
    </nav>
  );
}