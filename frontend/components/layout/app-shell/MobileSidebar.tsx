"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { navigation } from "@/config/navigation";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({
  open,
  onClose,
}: MobileSidebarProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-80 flex-col bg-white shadow-2xl lg:hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">
              FinPlan
            </h2>

            <p className="text-xs text-ash">
              Advisor Operating System
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-bone-deep"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-1">

            {navigation.map((item) => {

              const active =
                item.href &&
                (pathname === item.href ||
                  pathname.startsWith(item.href + "/"));

              const Icon = item.icon;

              return (
                <div key={item.id}>

                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                        active
                          ? "bg-obsidian text-white"
                          : "hover:bg-bone-deep"
                      }`}
                    >
                      {Icon && <Icon size={18} />}
                      {item.title}
                    </Link>
                  ) : (
                    <>
                      <div className="mb-2 mt-5 px-2 text-xs font-semibold uppercase tracking-wider text-ash">
                        {item.title}
                      </div>

                      {item.children?.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href ?? "#"}
                          onClick={onClose}
                          className="block rounded-lg px-4 py-2 text-sm hover:bg-bone-deep"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </>
                  )}

                </div>
              );
            })}

          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-line p-5">
          <div className="rounded-xl bg-bone-deep p-4">
            <p className="text-xs uppercase tracking-widest text-ash">
              Logged in as
            </p>

            <p className="mt-2 font-medium">
              Administrator
            </p>
          </div>
        </div>

      </aside>
    </>
  );
}