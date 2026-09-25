"use client";

import { useEffect, useState } from "react";

import MutualFundTable from "./MutualFundTable";

import { getMutualFunds } from "./mutual-fund.service";

import { MutualFund } from "@/components/data-table/examples/mutual-fund.types";

export default function MutualFundsPage() {

  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getMutualFunds().then((data) => {

      setMutualFunds(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <MutualFundTable mutualFunds={mutualFunds} />;

}