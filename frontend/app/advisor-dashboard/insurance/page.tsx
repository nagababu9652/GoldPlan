"use client";

import { useEffect, useState } from "react";

import InsuranceTable from "./InsuranceTable";

import { getInsurancePolicies } from "./insurance.service";

export default function InsurancePage() {

  const [insurancePolicies, setInsurancePolicies] = useState<Insurance[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getInsurancePolicies().then((data) => {

      setInsurancePolicies(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <InsuranceTable insurancePolicies={insurancePolicies} />;

}