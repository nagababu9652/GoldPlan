"use client";

import { useEffect, useState } from "react";

import BranchTable from "./BranchTable";

import { getBranches } from "./branch.service";

import { Branch } from "@/components/data-table/examples/branch.types";

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