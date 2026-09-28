"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getGroups,
  type Group,
} from "@/lib/api";

export default function GroupTable() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [groupType, setGroupType] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      const data = await getGroups(token, {
        search: search.trim() || undefined,
        group_type: groupType || undefined,
        include_inactive: includeInactive,
      });

      setGroups(data.groups);
    } catch (err) {
      console.error("Failed to load households:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load households.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGroups();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, groupType, includeInactive]);

  const groupTypes = useMemo(() => {
    return Array.from(
      new Set(
        groups
          .map((group) => group.group_type)
          .filter(Boolean),
      ),
    );
  }, [groups]);

  if (loading && groups.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading households...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-center">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search households..."
          className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />

        <select
          value={groupType}
          onChange={(event) => setGroupType(event.target.value)}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
        >
          <option value="">All types</option>

          {groupTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label className="flex h-10 items-center gap-2 whitespace-nowrap text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) =>
              setIncludeInactive(event.target.checked)
            }
          />

          Include inactive
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-card p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-5 py-3 font-medium">
                  Household
                </th>

                <th className="px-5 py-3 font-medium">
                  Type
                </th>

                <th className="px-5 py-3 font-medium">
                  Head
                </th>

                <th className="px-5 py-3 font-medium">
                  Members
                </th>

                <th className="px-5 py-3 font-medium">
                  Risk
                </th>

                <th className="px-5 py-3 font-medium">
                  Status
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/advisor-dashboard/groups/${group.id}`,
                        )
                      }
                      className="text-left"
                    >
                      <p className="font-medium">
                        {group.group_name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.group_code}
                      </p>
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    {group.group_type}
                  </td>

                  <td className="px-5 py-4">
                    {group.head_customer_name || "—"}
                  </td>

                  <td className="px-5 py-4">
                    {group.active_member_count}
                  </td>

                  <td className="px-5 py-4">
                    {group.risk_profile || "—"}
                  </td>

                  <td className="px-5 py-4">
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
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/advisor-dashboard/groups/${group.id}`,
                        )
                      }
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {groups.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <p className="font-medium">
                      No households found
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && groups.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Updating households...
        </p>
      )}
    </div>
  );
}