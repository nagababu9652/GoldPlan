"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  FilePlus2,
  UserPlus,
  FileText,
  MessageSquare,
  BriefcaseBusiness,
} from "lucide-react";

const actions = [
  {
    title: "Add Client",
    description: "Create a new client profile",
    href: "/advisor-dashboard/clients",
    icon: UserPlus,
  },
  {
    title: "Create Report",
    description: "Prepare a financial report",
    href: "/advisor-dashboard/reports",
    icon: FilePlus2,
  },
  {
    title: "View Documents",
    description: "Manage client documents",
    href: "/advisor-dashboard/documents",
    icon: FileText,
  },
  {
    title: "Messages",
    description: "View client conversations",
    href: "/advisor-dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "Portfolio",
    description: "Review managed portfolios",
    href: "/advisor-dashboard/portfolio",
    icon: BriefcaseBusiness,
  },
];

export default function QuickActions() {
  return (
    <section className="dashboard-panel bg-white/55 p-5 lg:p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
            Shortcuts
          </div>
          <h2 className="mt-3 font-serif text-2xl text-obsidian">
            Quick Actions
          </h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex min-h-[170px] flex-col rounded-[22px] border border-line bg-bone/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-obsidian/20 hover:bg-white"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-obsidian/10 bg-obsidian text-bone">
                  <Icon size={18} />
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-ash transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </div>

              <h3 className="text-sm font-medium text-obsidian">{action.title}</h3>
              <p className="mt-2 text-xs leading-5 text-ash">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}