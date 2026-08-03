"use client";

import { useEffect, useState } from "react";

import StpTable from "./StpTable";

import { getStps } from "./stp.service";

export default function StpPage() {

  const [stps, setStps] = useState<STP[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getStps().then((data) => {

      setStps(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <StpTable stps={stps} />;

}