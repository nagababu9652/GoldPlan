"use client";

import { useEffect, useState } from "react";

import BranchTable from "./BranchTable";

import { getBranches } from "./branch.service";

export default function BranchesPage() {

  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getBranches().then((data) => {

      setBranches(data);

      setLoading(false);

    });

  }, []);

  if (loading) return <div>Loading...</div>;

  return <BranchTable branches={branches} />;

}