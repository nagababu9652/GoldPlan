"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Shield,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: Briefcase,
  },
  {
    title: "Insurance",
    href: "/insurance",
    icon: Shield,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-[calc(100vh-64px)] w-72 shrink-0 flex-col border-r border-line bg-white sticky top-16">

      {/* Workspace */}
      <div className="border-b border-line px-6 py-5">
        <p className="text-xs uppercase tracking-widest text-ash">
          Workspace
        </p>

        <h2 className="mt-2 text-lg font-semibold">
          FinPlan India
        </h2>

        <p className="mt-1 text-sm text-ash">
          Advisor Operating System
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-ash">
          Main Navigation
        </p>

        <div className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
                  active
                    ? "bg-obsidian text-bone shadow-sm"
                    : "text-ash hover:bg-bone-deep hover:text-obsidian"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />

                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                </div>

                <ChevronRight
                  size={16}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-line p-5">
        <div className="rounded-xl bg-bone-deep p-4">
          <p className="text-xs uppercase tracking-wider text-ash">
            Subscription
          </p>

          <h4 className="mt-2 font-semibold">
            Professional Plan
          </h4>

          <p className="mt-1 text-sm text-ash">
            Valid until Dec 2026
          </p>
        </div>
      </div>
    </aside>
  );
}