"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
} from "lucide-react";

export default function Notifications() {
  return (
    <section className="dashboard-panel overflow-hidden bg-bone/80">
      <div className="flex items-end justify-between border-b border-line p-6 lg:p-7">
        <div>
          <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
            Attention
          </div>

          <h2 className="mt-3 font-serif text-2xl text-obsidian">
            Notifications
          </h2>

          <p className="mt-1 text-sm text-ash">
            Updates that may need your attention
          </p>
        </div>

        <Link
          href="/advisor-dashboard/notifications"
          className="hidden items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-obsidian u-link sm:inline-flex"
        >
          View all
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Empty state */}
      <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bone-deep">
          <Bell size={18} className="text-ash" />

          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-bone bg-emerald-600" />
        </div>

        <h3 className="mt-5 font-medium text-obsidian">
          You’re all caught up
        </h3>

        <p className="mt-2 max-w-[260px] text-xs leading-5 text-ash">
          Client updates, reminders and important
          activity will appear here when there is
          something to review.
        </p>

        <Link
          href="/advisor-dashboard/notifications"
          className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-obsidian transition-opacity hover:opacity-60"
        >
          Open notifications
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}