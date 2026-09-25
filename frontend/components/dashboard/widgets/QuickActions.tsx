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
    <section>
      <div className="mb-5">
        <div className="label-mono text-ash">
          Shortcuts
        </div>

        <h2 className="mt-2 font-serif text-2xl text-obsidian">
          Quick Actions
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-2xl border border-line bg-bone p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-obsidian hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line">
                  <Icon
                    size={18}
                    className="text-obsidian"
                  />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-ash transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-obsidian"
                />
              </div>

              <h3 className="mt-5 text-sm font-medium text-obsidian">
                {action.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-ash">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}