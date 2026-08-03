"use client";

import { ReactNode, useState } from "react";

import Header from "./Header";
import Footer from "./Footer";
import MobileSidebar from "./MobileSidebar";

import Sidebar from "../sidebar/Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-bone">

      {/* Header */}
      <Header
        onMenuClick={() =>
          setMobileSidebarOpen(true)
        }
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* Body */}
      <div className="flex">

        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex min-h-[calc(100vh-64px)] flex-1 flex-col">

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <Footer />

        </div>

      </div>

    </div>
  );
}