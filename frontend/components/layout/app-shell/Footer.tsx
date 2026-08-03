"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex flex-col items-center justify-between gap-4 px-6 py-4 text-sm text-ash lg:flex-row">

        {/* Left */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-obsidian">
            FinPlan
          </span>

          <span>•</span>

          <span>Version 1.0.0</span>

          <span>•</span>

          <span>Build 2026.07</span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="hover:text-obsidian transition-colors"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="hover:text-obsidian transition-colors"
          >
            Terms
          </Link>

          <Link
            href="/support"
            className="hover:text-obsidian transition-colors"
          >
            Support
          </Link>

          <Link
            href="/documentation"
            className="hover:text-obsidian transition-colors"
          >
            Documentation
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />

          <span>All Systems Operational</span>
        </div>

      </div>
    </footer>
  );
}