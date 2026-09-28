"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Users,
  X,
  CalendarDays,
  Receipt,
  UserRound,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  path?: string;
  href?: string;
}

interface NavModule {
  label: string;
  icon: React.ElementType;
  path?: string;
  items?: NavItem[];
}

const navigation: NavModule[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/advisor-dashboard",
  },
  {
    label: "CRM",
    icon: Users,
    items: [
      {
        label: "Clients",
        path: "/advisor-dashboard/clients",
      },
      {
        label: "Households",
        path: "/advisor-dashboard/groups",
        href: "/advisor-dashboard/groups",
      },
      {
        label: "Meetings",
        path: "/advisor-dashboard/meetings",
      },
      {
        label: "Tasks",
        path: "/advisor-dashboard/tasks",
      },
      {
        label: "Messages",
        path: "/advisor-dashboard/messages",
      },
    ],
  },
  {
    label: "Portfolio",
    icon: BarChart3,
    path: "/advisor-dashboard/portfolio",
  },
  {
    label: "Reports",
    icon: FileText,
    items: [
      {
        label: "Reports",
        path: "/advisor-dashboard/reports",
      },
    ],
  },
  {
    label: "Documents",
    icon: BriefcaseBusiness,
    items: [
      {
        label: "Documents",
        path: "/advisor-dashboard/documents",
      },
    ],
  },
  {
    label: "Transactions",
    icon: Receipt,
    path: "/advisor-dashboard/transactions",
  },
  {
    label: "Admin",
    icon: Settings,
    items: [
      {
        label: "Profile",
        path: "/advisor-dashboard/profile",
      },
      {
        label: "Notifications",
        path: "/advisor-dashboard/notifications",
      },
    ],
  },
];

function isPathActive(
  pathname: string,
  path?: string,
  href?: string
) {
  const target = href ?? path;

  if (!target) return false;

  return (
    pathname === target ||
    (target !== "/advisor-dashboard" &&
      pathname.startsWith(`${target}/`))
  );
}

function isModuleActive(
  pathname: string,
  module: NavModule
) {
  if (module.path) {
    return isPathActive(pathname, module.path);
  }

  return module.items?.some((item) =>
    isPathActive(pathname, item.path)
  );
}

export default function AdvisorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [userName, setUserName] =
    useState("Advisor");

  useEffect(() => {
    const token =
      localStorage.getItem("finplan_token");

    const userStr =
      localStorage.getItem("finplan_user");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        if (
          user.role &&
          user.role !== "advisor"
        ) {
          router.replace("/dashboard");
          return;
        }

        setUserName(
          user.name ||
            user.full_name ||
            user.email?.split("@")[0] ||
            "Advisor"
        );
      } catch {
        setUserName("Advisor");
      }
    }
  }, [router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("finplan_token");
    localStorage.removeItem(
      "finplan_refresh_token"
    );
    localStorage.removeItem("finplan_user");

    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-bone text-obsidian">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-obsidian/50 lg:hidden"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* Application shell */}
      <div className="min-h-screen">
        {/* Top black header */}
        <header className="sticky top-0 z-50 bg-obsidian text-bone">
            <div className="shell-gutter flex min-h-[58px] items-center gap-5">
            {/* Logo */}
            <Link
              href="/advisor-dashboard"
              className="shrink-0"
            >
              <div className="font-serif text-[25px] leading-none text-antique-light">
                FinPlan.
              </div>

              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ash-light">
                Advisor Portal
              </div>
            </Link>

            {/* Version */}
            <span className="hidden text-[10px] font-mono text-ash-light xl:block">
              v1.0
            </span>

            {/* Search */}
            <div className="hidden min-w-0 flex-1 md:block">
              <div className="mx-auto flex h-9 max-w-[430px] items-center gap-2 rounded-md bg-bone px-3 text-obsidian">
                <Search
                  size={16}
                  className="shrink-0 text-ash"
                />

                <input
                  type="search"
                  placeholder="Search a menu item"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ash"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/advisor-dashboard/notifications"
                aria-label="Notifications"
                className="relative rounded-md p-2 text-bone/75 transition-colors hover:bg-obsidian-soft hover:text-bone"
              >
                <Bell size={18} />

                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-antique px-1 font-mono text-[9px] text-obsidian">
                  2
                </span>
              </Link>

              <Link
                href="/advisor-dashboard/profile"
                className="hidden items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-obsidian-soft sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-antique font-medium text-obsidian">
                  {userName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="text-left">
                  <div className="max-w-[140px] truncate text-xs font-medium">
                    {userName}
                  </div>

                  <div className="font-mono text-[9px] uppercase tracking-wider text-ash-light">
                    Advisor
                  </div>
                </div>
              </Link>

              {/* Mobile menu */}
              <button
                type="button"
                aria-label="Open navigation"
                className="rounded-md p-2 text-bone lg:hidden"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Module navigation */}
        <nav className="relative z-40 hidden border-b border-line bg-bone lg:block">
            <div className="shell-gutter flex min-h-[76px] items-stretch overflow-visible">
            {navigation.map((module) => {
              const Icon = module.icon;
              const active = isModuleActive(
                pathname,
                module
              );

              return (
                <div
                  key={module.label}
                  className="group relative flex-1"
                >
                  {/* Main module */}
                  {module.path ? (
                    <Link
                      href={module.path}
                      className={[
                        "flex h-full min-w-[110px] flex-col items-center justify-center gap-1.5 border-r border-line px-4",
                        "text-xs transition-colors",
                        active
                          ? "bg-antique/10 text-obsidian"
                          : "text-ash hover:bg-bone-deep hover:text-obsidian",
                      ].join(" ")}
                    >
                      <Icon
                        size={22}
                        strokeWidth={1.7}
                      />

                      <span className="whitespace-nowrap font-medium">
                        {module.label}
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={[
                        "flex h-full w-full min-w-[110px] flex-col items-center justify-center gap-1.5 border-r border-line px-4",
                        "text-xs transition-colors",
                        active
                          ? "bg-antique/10 text-obsidian"
                          : "text-ash hover:bg-bone-deep hover:text-obsidian",
                      ].join(" ")}
                    >
                      <Icon
                        size={22}
                        strokeWidth={1.7}
                      />

                      <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                        {module.label}
                        <ChevronDown
                          size={12}
                          className="transition-transform duration-150 group-hover:rotate-180"
                        />
                      </span>
                    </button>
                  )}

                  {/* Hover submenu */}
                  {module.items &&
                    module.items.length > 0 && (
                      <div className="invisible absolute left-0 top-full min-w-[210px] translate-y-1 border border-line bg-bone opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="border-b border-line px-4 py-3">
                          <div className="label-mono text-ash">
                            {module.label}
                          </div>
                        </div>

                        <div className="py-1.5">
                          {module.items.map(
                            (item) => {
                              const itemPath = item.href ?? item.path;
                              const itemActive =
                                isPathActive(
                                  pathname,
                                  item.path,
                                  item.href
                                );

                              return (
                                <Link
                                  key={`${itemPath ?? item.label}-${item.label}`}
                                  href={itemPath ?? "/advisor-dashboard"}
                                  className={[
                                    "flex items-center px-4 py-2.5 text-sm transition-colors",
                                    itemActive
                                      ? "bg-antique/15 font-medium text-obsidian"
                                      : "text-ash hover:bg-bone-deep hover:text-obsidian",
                                  ].join(" ")}
                                >
                                  {item.label}
                                </Link>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <aside className="fixed inset-y-0 left-0 z-50 w-[290px] overflow-y-auto bg-obsidian text-bone lg:hidden">
            <div className="flex items-center justify-between border-b border-obsidian-soft px-5 py-5">
              <Link href="/advisor-dashboard">
                <div className="font-serif text-[25px] text-antique-light">
                  FinPlan.
                </div>

                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ash-light">
                  Advisor Portal
                </div>
              </Link>

              <button
                type="button"
                aria-label="Close navigation"
                className="rounded-md p-2 text-ash-light hover:bg-obsidian-soft hover:text-bone"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-5 rounded-lg bg-obsidian-soft p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-antique font-medium text-obsidian">
                    {userName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm">
                      {userName}
                    </div>

                    <div className="font-mono text-[9px] uppercase tracking-wider text-ash-light">
                      Advisor
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {navigation.map((module) => {
                  const Icon = module.icon;
                  const active =
                    isModuleActive(
                      pathname,
                      module
                    );

                  return (
                    <div key={module.label}>
                      {module.path ? (
                        <Link
                          href={module.path}
                          className={[
                            "flex items-center gap-3 rounded-md px-3 py-3 text-sm",
                            active
                              ? "bg-antique text-obsidian"
                              : "text-ash-light hover:bg-obsidian-soft hover:text-bone",
                          ].join(" ")}
                        >
                          <Icon size={18} />
                          {module.label}
                        </Link>
                      ) : (
                        <div>
                          <div
                            className={[
                              "flex items-center gap-3 rounded-md px-3 py-3 text-sm",
                              active
                                ? "bg-obsidian-soft text-bone"
                                : "text-ash-light",
                            ].join(" ")}
                          >
                            <Icon size={18} />
                            {module.label}
                          </div>

                          <div className="ml-9 mt-1 space-y-1">
                            {module.items?.map(
                              (item) => {
                                const itemPath = item.href ?? item.path;

                                return (
                                  <Link
                                    key={`${itemPath ?? item.label}-${item.label}`}
                                    href={itemPath ?? "/advisor-dashboard"}
                                    className="block rounded-md px-3 py-2 text-xs text-ash-light hover:bg-obsidian-soft hover:text-bone"
                                  >
                                    {item.label}
                                  </Link>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-8 flex w-full items-center gap-3 border-t border-obsidian-soft px-3 pt-5 text-sm text-ash-light hover:text-bone"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </aside>
        )}

        {/* Breadcrumb */}
        <div className="border-b border-line bg-bone-deep">
          <div className="shell-gutter flex min-h-[38px] items-center text-[11px] text-ash">
            <Link
              href="/advisor-dashboard"
              className="hover:text-obsidian"
            >
              Home
            </Link>

            <span className="mx-2 text-line">
              &gt;
            </span>

            <span className="text-obsidian">
              Advisor Workspace
            </span>
          </div>
        </div>

        {/* Page */}
        <main className="shell-body min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}