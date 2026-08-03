"use client";

import { useEffect, useState } from "react";

import PortfolioTable from "./PortfolioTable";

import { getPortfolios } from "./portfolio.service";

export default function PortfolioPage() {

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getPortfolios().then((data) => {

      setPortfolios(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <PortfolioTable portfolios={portfolios} />;

}