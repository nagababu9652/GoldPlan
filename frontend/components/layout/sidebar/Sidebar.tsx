"use client";

import SidebarMenu from "./SidebarMenu";
import SidebarWorkspace from "./SidebarWorkspace";
import SidebarFooter from "./SidebarFooter";

export default function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-72 shrink-0 border-r border-line bg-white lg:flex lg:flex-col">

      {/* Workspace */}
      <SidebarWorkspace />

      {/* Navigation */}
      <SidebarMenu />

      {/* Footer */}
      <SidebarFooter />

    </aside>
  );
}