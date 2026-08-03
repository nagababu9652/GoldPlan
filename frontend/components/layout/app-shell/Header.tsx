"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Menu,
  Plus,
  Search,
  Settings,
} from "lucide-react";

interface HeaderProps {
  onMenuClick?: () =>void;
}

export default function Header({
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">

      <div className="flex h-full items-center justify-between px-6">

        {/* LEFT */}
        <div className="flex items-center gap-5">

          {/* Mobile Menu */}
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 transition hover:bg-bone-deep lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-obsidian text-bone font-bold">
              F
            </div>

            <div className="hidden md:block">
              <h1 className="font-semibold">
                FinPlan
              </h1>

              <p className="text-xs text-ash">
                Advisor Operating System
              </p>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden xl:flex">

            <div className="flex w-96 items-center rounded-xl border border-line bg-bone px-4 py-2">

              <Search
                size={18}
                className="mr-3 text-ash"
              />

              <input
                type="text"
                placeholder="Search customers, reports, portfolios..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-ash"
              />

              <kbd className="rounded border border-line bg-white px-2 py-1 text-xs text-ash">
                Ctrl K
              </kbd>

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* Quick Add */}
          <button className="hidden md:flex items-center gap-2 rounded-xl bg-obsidian px-4 py-2 text-sm font-medium text-white transition hover:bg-antique hover:text-obsidian">

            <Plus size={16} />

            New

          </button>

          {/* Notifications */}
          <button className="relative rounded-xl p-2 transition hover:bg-bone-deep">

            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

          </button>

          {/* Settings */}
          <button className="rounded-xl p-2 transition hover:bg-bone-deep">

            <Settings size={20} />

          </button>

          {/* User */}
          <button className="ml-2 flex items-center gap-3 rounded-xl border border-line px-3 py-2 transition hover:bg-bone-deep">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-obsidian font-semibold text-white">
              A
            </div>

            <div className="hidden text-left lg:block">

              <div className="text-sm font-medium">
                Administrator
              </div>

              <div className="text-xs text-ash">
                Super Admin
              </div>

            </div>

            <ChevronDown
              size={16}
              className="hidden lg:block"
            />

          </button>

        </div>

      </div>

    </header>
  );
}