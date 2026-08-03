"use client";

import { Crown } from "lucide-react";

export default function SidebarFooter() {
  return (
    <div className="border-t border-line p-4">

      <div className="rounded-xl bg-bone-deep p-4">

        <div className="flex items-center gap-2">

          <Crown
            size={18}
            className="text-antique"
          />

          <span className="font-medium">
            Professional Plan
          </span>

        </div>

        <p className="mt-2 text-sm text-ash">
          License valid until Dec 2026
        </p>

      </div>

    </div>
  );
}