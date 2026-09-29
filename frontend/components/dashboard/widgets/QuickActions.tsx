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
    <section className="px-4 py-6 bg-bone/90 rounded-none ring-[1px] ring-line shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div className="mb-6">
        <div className="label-mono text-ash">
          Shortcuts
        </div>
        <h2 className="mt-2 font-serif text-2xl text-obsidian">
          Quick Actions
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex flex-col rounded-none border border-line bg-bone p-6 transition-colors duration-200 hover:bg-bone-deep"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line">
                  <Icon size={18} className="text-obsidian" />
                </div>
                <ArrowUpRight size={16} className="text-ash transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <h3 className="text-sm font-medium text-obsidian">{action.title}</h3>
              <p className="mt-1 text-xs leading-5 text-ash">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}