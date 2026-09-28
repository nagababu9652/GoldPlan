"use client";

import { useRouter } from "next/navigation";

import type { Group } from "@/lib/api";

type Props = {
  group: Group;
};

export default function GroupHeader({ group }: Props) {
  const router = useRouter();

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              router.push("/advisor-dashboard/groups")
            }
            className="mb-3 text-sm text-muted-foreground hover:underline"
          >
            ← Back to Households
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">
              {group.group_name}
            </h1>

            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {group.group_code}
            </span>

            <span
              className={
                group.is_active
                  ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              {group.is_active
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {group.group_type}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Members
            </p>

            <p className="mt-1 text-lg font-semibold">
              {group.active_member_count}
            </p>
          </div>

          <div className="rounded-lg border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Head
            </p>

            <p className="mt-1 text-sm font-semibold">
              {group.head_customer_name || "—"}
            </p>
          </div>

          <div className="rounded-lg border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Risk
            </p>

            <p className="mt-1 text-sm font-semibold">
              {group.risk_profile || "—"}
            </p>
          </div>

          <div className="rounded-lg border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Objective
            </p>

            <p className="mt-1 truncate text-sm font-semibold">
              {group.investment_objective || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}