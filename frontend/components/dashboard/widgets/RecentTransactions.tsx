"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Receipt,
} from "lucide-react";
import {
  getTransactions,
  type AdvisorTransaction,
} from "@/app/advisor-dashboard/transactions/transaction.service";

function formatCurrency(value: number | string) {
  const amount = Number(value);

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTransactionLabel(type?: string) {
  if (!type) return "Transaction";

  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function TransactionIcon({ type }: { type?: string }) {
  const normalized = type?.toUpperCase();

  const isOutgoing =
    normalized === "WITHDRAWAL" ||
    normalized === "REDEMPTION";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-bone-deep">
      {isOutgoing ? (
        <ArrowDownLeft
          size={16}
          className="text-red-600"
        />
      ) : (
        <ArrowUpRight
          size={16}
          className="text-emerald-700"
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toUpperCase();

  const className =
    normalized === "COMPLETED"
      ? "border-emerald-700/30 text-emerald-700"
      : normalized === "PENDING"
      ? "border-amber-700/30 text-amber-700"
      : "border-line text-ash";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-wide ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default function RecentTransactions() {
  const [transactions, setTransactions] =
    useState<AdvisorTransaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await getTransactions(token);

        setTransactions(response.slice(0, 5));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load recent transactions."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  return (
    <section className="dashboard-panel overflow-hidden bg-bone/80">
      <div className="flex items-end justify-between border-b border-line p-6 lg:p-7">
        <div>
          <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
            Financial Activity
          </div>

          <h2 className="mt-3 font-serif text-2xl text-obsidian">
            Recent transactions
          </h2>

          <p className="mt-1 text-sm text-ash">
            Latest activity across your client relationships
          </p>
        </div>

        <Link
          href="/advisor-dashboard/transactions"
          className="hidden items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-obsidian u-link sm:inline-flex"
        >
          View all
          <ArrowRight size={14} />
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
              <div className="h-10 w-10 shrink-0 rounded-full bg-bone-deep" />

              <div className="min-w-0 flex-1">
                <div className="h-3 w-36 rounded bg-bone-deep" />
                <div className="mt-2 h-2 w-28 rounded bg-bone-deep" />
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
      ) : transactions.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bone-deep">
            <Receipt
              size={18}
              className="text-ash"
            />
          </div>

          <h3 className="mt-4 text-sm font-medium text-obsidian">
            No recent transactions
          </h3>

          <p className="mt-2 max-w-xs text-xs leading-5 text-ash">
            New financial activity will appear here as
            transactions are recorded.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {transactions.map((transaction) => (
            <Link
              key={transaction.id}
              href={`/advisor-dashboard/transactions/${transaction.id}`}
              className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-bone-deep lg:px-7"
            >
              {/* Transaction type */}
              <TransactionIcon
                type={transaction.transaction_type}
              />

              {/* Transaction information */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-obsidian">
                  Transaction #{transaction.id}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ash">
                  <span>
                    Customer #{transaction.customer_id}
                  </span>

                  <span className="text-line">
                    •
                  </span>

                  <span>
                    {getTransactionLabel(
                      transaction.transaction_type
                    )}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="hidden text-right sm:block">
                <div className="font-serif text-base text-obsidian">
                  {formatCurrency(transaction.amount)}
                </div>

                <div className="mt-1 text-[10px] font-mono uppercase tracking-wide text-ash">
                  {formatDate(
                    transaction.transaction_date
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="hidden md:block">
                <StatusBadge
                  status={transaction.status}
                />
              </div>

              <ArrowRight
                size={15}
                className="shrink-0 text-ash transition-all duration-200 group-hover:translate-x-1 group-hover:text-obsidian"
              />
            </Link>
          ))}
        </div>
      )}

      {/* Footer */}
      <Link
        href="/advisor-dashboard/transactions"
        className="flex items-center justify-between border-t border-line px-6 py-4 text-xs font-mono uppercase tracking-wider text-ash transition-colors hover:bg-bone-deep hover:text-obsidian lg:px-7"
      >
        <span>View all transactions</span>

        <ArrowRight size={14} />
      </Link>
    </section>
  );
}