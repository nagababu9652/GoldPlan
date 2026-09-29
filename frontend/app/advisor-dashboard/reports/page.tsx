"use client";

import { useEffect, useState } from "react";

import ReportTable from "./ReportTable";

import { getReports } from "./report.service";

import { Report } from "@/components/data-table/examples/report.types";

export default function ReportsPage() {

  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getReports().then((data) => {

      setReports(data);

      setLoading(false);

    });

  }, []);

  if (loading) return (
    <div className="dashboard-panel p-6 lg:p-8">
      <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">Reports</div>
      <p className="mt-4 text-sm text-ash">Loading reports...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Reporting
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Reports
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Review client performance, portfolio activity, and advisory summaries.
        </p>
      </div>

      <ReportTable reports={reports} />
    </div>
  );

}