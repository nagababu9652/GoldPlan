"use client";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";

import { portfolioColumns } from "./portfolio-columns";
import { Holding } from "./portfolio-types";

interface Props {
  holdings: Holding[];
}

export default function HoldingsTable({
  holdings,
}: Props) {
  return (
    <EnterpriseTable
      columns={portfolioColumns}
      data={holdings}
    />
  );
}