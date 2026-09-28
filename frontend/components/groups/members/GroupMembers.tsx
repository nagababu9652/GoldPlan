"use client";

import { useEffect, useState } from "react";

import {
  getGroupMembers,
  type GroupMember,
} from "@/lib/api";

type Props = {
  groupId: string;
};

export default function GroupMembers({
  groupId,
}: Props) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      const data = await getGroupMembers(
        token,
        groupId,
      );

      setMembers(data.members);
    } catch (err) {
      console.error(
        "Failed to load household members:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load household members.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading members...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-card p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Household Members
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Clients currently belonging to this household.
          </p>
        </div>

        <button
          type="button"
          className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Add Member
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-5 py-3 font-medium">
                  Client
                </th>

                <th className="px-5 py-3 font-medium">
                  Relationship
                </th>

                <th className="px-5 py-3 font-medium">
                  Email
                </th>

                <th className="px-5 py-3 font-medium">
                  Joined
                </th>

                <th className="px-5 py-3 font-medium">
                  Role
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium">
                      {member.display_name}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {member.customer_code}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    {member.relationship_type || "—"}
                  </td>

                  <td className="px-5 py-4">
                    {member.email || "—"}
                  </td>

                  <td className="px-5 py-4">
                    {member.joined_on || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {member.is_group_head && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                          Head
                        </span>
                      )}

                      {member.is_primary && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                          Primary
                        </span>
                      )}

                      {!member.is_group_head &&
                        !member.is_primary && (
                          <span className="text-muted-foreground">
                            Member
                          </span>
                        )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <p className="font-medium">
                      No members
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Add a client to this household.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}