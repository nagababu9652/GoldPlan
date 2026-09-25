"use client";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";
import { goalColumns } from "./columns";
import { Goal } from "./types";

interface Props {
  goals: Goal[];
}

export default function GoalsTable({
  goals,
}: Props) {
  return (
    <EnterpriseTable
      columns={goalColumns}
      data={goals}
    />
  );
}