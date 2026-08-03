"use client";

import { useEffect, useState } from "react";

import ReportTable from "./ReportTable";

import { getReports } from "./report.service";

export default function ReportsPage() {

  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getReports().then((data) => {

      setReports(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <ReportTable reports={reports} />;

}