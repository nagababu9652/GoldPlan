"use client";

import { useEffect, useState } from "react";

import SwpTable from "./SwpTable";

import { getSwps } from "./swp.service";

export default function SwpPage() {

  const [swps, setSwps] = useState<SWP[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getSwps().then((data) => {

      setSwps(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <SwpTable swps={swps} />;

}