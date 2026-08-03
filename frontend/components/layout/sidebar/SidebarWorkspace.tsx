"use client";

import { Building2 } from "lucide-react";

export default function SidebarWorkspace() {
  return (
    <div className="border-b border-line p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-obsidian text-bone">
          <Building2 size={22} />
        </div>

        <div>

          <h2 className="text-base font-semibold">
            FinPlan India
          </h2>

          <p className="text-sm text-ash">
            Advisor Operating System
          </p>

        </div>

      </div>

    </div>
  );
}