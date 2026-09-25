"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdvisorDashboard,
  getAdvisorPortfolio,
  type AdvisorDashboard,
} from "@/lib/api";

interface UseDashboardReturn {
  data: AdvisorDashboard | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] =
    useState<AdvisorDashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("finplan_token");

      if (!token) {
        setError(
          "Please login to access the advisor dashboard."
        );
        return;
      }

      const [dashboard, portfolio] =
        await Promise.all([
          getAdvisorDashboard(token),
          getAdvisorPortfolio(token),
        ]);

      setData({
        ...dashboard,
        total_aum: portfolio.total_value,
        portfolio_value: portfolio.total_value,
      });
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load advisor dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    loading,
    error,
    refresh: loadDashboard,
  };
}