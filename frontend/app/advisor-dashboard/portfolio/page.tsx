"use client";

import { useEffect, useState } from "react";

import PortfolioTable from "./PortfolioTable";

import { getPortfolios } from "./portfolio.service";

import { Portfolio } from "@/components/data-table/examples/portfolio.types";

export default function PortfolioPage() {

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getPortfolios().then((data) => {

      setPortfolios(data);

      setLoading(false);

    });

  }, []);

  if (loading) return (
    <div className="dashboard-panel p-6 lg:p-8">
      <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">Portfolio</div>
      <p className="mt-4 text-sm text-ash">Loading portfolio...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Portfolio oversight
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Portfolio
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Review managed holdings, allocations, and portfolio movements.
        </p>
      </div>

      <PortfolioTable portfolios={portfolios} />
    </div>
  );

}