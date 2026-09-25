"use client";

import { useEffect, useState } from "react";
import {
  getAdvisorPortfolio,
  type AdvisorPortfolio,
} from "@/lib/api";

interface PortfolioPerformanceProps {
  height?: number;
}

function formatCurrency(value: number) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export default function PortfolioPerformance({
  height = 320,
}: PortfolioPerformanceProps) {
  const [portfolio, setPortfolio] =
    useState<AdvisorPortfolio | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("finplan_token");

        if (!token) {
          throw new Error("Authentication required");
        }

        const data = await getAdvisorPortfolio(token);

        setPortfolio(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load portfolio"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-line bg-bone p-6 lg:p-7">
        <div className="mb-7">
          <div className="label-mono text-ash">
            PORTFOLIO
          </div>

          <h2 className="mt-2 font-serif text-2xl text-obsidian">
            Assets under management
          </h2>

          <p className="mt-1 text-sm text-ash">
            Current portfolio value and allocation
          </p>
        </div>

        <div
          className="animate-pulse rounded-xl bg-ash/10"
          style={{ height }}
        />
      </section>
    );
  }

  if (error || !portfolio) {
    return (
      <section className="rounded-2xl border border-line bg-bone p-6 lg:p-7">
        <div className="mb-7">
          <div className="label-mono text-ash">
            PORTFOLIO
          </div>

          <h2 className="mt-2 font-serif text-2xl text-obsidian">
            Assets under management
          </h2>
        </div>

        <div className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-sm text-red-600">
          {error || "Unable to load portfolio"}
        </div>
      </section>
    );
  }

  const isPositive =
    portfolio.returns_percentage >= 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-bone">
      {/* Header */}
      <div className="border-b border-line p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="label-mono text-ash">
              PORTFOLIO
            </div>

            <h2 className="mt-2 font-serif text-2xl text-obsidian">
              Assets under management
            </h2>

            <p className="mt-1 text-sm text-ash">
              Current portfolio value and asset allocation
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-serif text-[34px] leading-none tracking-tight text-obsidian">
              {formatCurrency(portfolio.total_value)}
            </p>

            <p
              className={`mt-2 text-sm font-medium ${
                isPositive
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {formatPercent(
                portfolio.returns_percentage
              )}

              <span className="ml-1 text-xs text-ash">
                returns
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-1 border-b border-line sm:grid-cols-3">
        <div className="p-6 lg:p-7 sm:pr-5">
          <p className="label-mono text-ash">
            INVESTED
          </p>

          <p className="mt-3 font-serif text-xl text-obsidian">
            {formatCurrency(portfolio.total_cost)}
          </p>
        </div>

        <div className="border-line p-6 lg:p-7 sm:border-l sm:px-5">
          <p className="label-mono text-ash">
            TOTAL RETURNS
          </p>

          <p
            className={`mt-3 font-serif text-xl ${
              portfolio.total_returns >= 0
                ? "text-emerald-700"
                : "text-red-600"
            }`}
          >
            {formatCurrency(
              portfolio.total_returns
            )}
          </p>
        </div>

        <div className="border-line p-6 lg:p-7 sm:border-l sm:pl-5">
          <p className="label-mono text-ash">
            RETURN
          </p>

          <p
            className={`mt-3 font-serif text-xl ${
              isPositive
                ? "text-emerald-700"
                : "text-red-600"
            }`}
          >
            {formatPercent(
              portfolio.returns_percentage
            )}
          </p>
        </div>
      </div>

      {/* Allocation */}
      <div className="p-6 lg:p-7">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="label-mono text-ash">
              ALLOCATION
            </div>

            <h3 className="mt-2 font-serif text-xl text-obsidian">
              Portfolio composition
            </h3>

            <p className="mt-1 text-xs text-ash">
              Distribution across current holdings
            </p>
          </div>

          <span className="shrink-0 text-xs font-mono uppercase tracking-wide text-ash">
            {portfolio.holdings.length} holdings
          </span>
        </div>

        <div className="space-y-7">
          {portfolio.holdings.map((holding) => {
            const allocation = Math.min(
              Math.max(holding.allocation, 0),
              100
            );

            const holdingPositive =
              holding.returns >= 0;

            return (
              <div key={holding.name}>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-obsidian">
                      {holding.name}
                    </p>

                    <p className="mt-1 text-xs text-ash">
                      {formatCurrency(holding.value)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-serif text-base text-obsidian">
                      {holding.allocation}%
                    </p>

                    <p
                      className={`mt-1 text-[11px] ${
                        holdingPositive
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {formatPercent(
                        holding.returns
                      )}
                    </p>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-ash/10">
                  <div
                    className="h-full rounded-full bg-obsidian transition-all duration-700"
                    style={{
                      width: `${allocation}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}