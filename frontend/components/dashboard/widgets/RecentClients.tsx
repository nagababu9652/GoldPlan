"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  UserRound,
} from "lucide-react";
import { getClients, type Client } from "@/lib/api";

function formatCurrency(value?: number | null) {
  if (value == null) return "—";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

function getStatus(status?: string | null) {
  const normalized = status?.toUpperCase();

  if (normalized === "ACTIVE") {
    return {
      label: "Active",
      className:
        "border-emerald-700/30 text-emerald-700",
    };
  }

  if (normalized === "INACTIVE") {
    return {
      label: "Inactive",
      className: "border-line text-ash",
    };
  }

  return {
    label: status
      ? status
          .toLowerCase()
          .replace(/\b\w/g, (char) =>
            char.toUpperCase()
          )
      : "Unknown",
    className: "border-line text-ash",
  };
}

function getInitials(name?: string) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

export default function RecentClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClients() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        const response = await getClients(token);

        setClients(response.clients.slice(0, 5));
      } catch (err) {
        console.error(
          "Failed to load recent clients:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load clients."
        );
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-bone">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-line p-6 lg:p-7">
        <div>
          <div className="label-mono text-ash">
            CLIENT RELATIONSHIPS
          </div>

          <h2 className="mt-2 font-serif text-2xl text-obsidian">
            Recent clients
          </h2>

          <p className="mt-1 text-sm text-ash">
            Your latest client relationships
          </p>
        </div>

        <Link
          href="/advisor-dashboard/clients"
          className="hidden items-center gap-2 text-xs font-mono uppercase tracking-wider text-obsidian u-link sm:inline-flex"
        >
          View all
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="divide-y divide-line">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-4 px-6 py-5 lg:px-7"
            >
              <div className="h-11 w-11 shrink-0 rounded-full bg-bone-deep" />

              <div className="min-w-0 flex-1">
                <div className="h-3 w-32 rounded bg-bone-deep" />
                <div className="mt-2 h-2 w-24 rounded bg-bone-deep" />
              </div>

              <div className="hidden h-3 w-20 rounded bg-bone-deep sm:block" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 lg:p-7">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line">
            <UserRound
              size={19}
              className="text-ash"
            />
          </div>

          <h3 className="mt-4 text-sm font-medium text-obsidian">
            No clients yet
          </h3>

          <p className="mt-2 max-w-xs text-xs leading-5 text-ash">
            Client relationships will appear here as
            they are added to your workspace.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {clients.map((client) => {
            const status = getStatus(client.status);

            return (
              <Link
                key={client.id}
                href={`/advisor-dashboard/clients/${client.id}`}
                className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-bone-deep lg:px-7"
              >
                {/* Avatar */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-bone-deep transition-colors group-hover:border-obsidian/20">
                  <span className="font-serif text-sm text-obsidian">
                    {getInitials(client.name)}
                  </span>
                </div>

                {/* Client */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-obsidian">
                    {client.name || "Unnamed Client"}
                  </div>

                  <div className="mt-1 truncate text-xs text-ash">
                    {client.customer_code}
                  </div>
                </div>

                {/* Net worth */}
                <div className="hidden text-right sm:block">
                  <div className="font-serif text-base text-obsidian">
                    {formatCurrency(client.net_worth)}
                  </div>

                  <div className="mt-1 text-[10px] font-mono uppercase tracking-wide text-ash">
                    Net worth
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`hidden rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-wide sm:inline-flex ${status.className}`}
                >
                  {status.label}
                </span>

                <ArrowRight
                  size={15}
                  className="shrink-0 text-ash transition-all duration-200 group-hover:translate-x-1 group-hover:text-obsidian"
                />
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <Link
        href="/advisor-dashboard/clients"
        className="flex items-center justify-between border-t border-line px-6 py-4 text-xs font-mono uppercase tracking-wider text-ash transition-colors hover:bg-bone-deep hover:text-obsidian lg:px-7"
      >
        <span>Manage client relationships</span>

        <ArrowRight size={14} />
      </Link>
    </section>
  );
}