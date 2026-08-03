"use client";

import { DataTable } from "@/components/data-table";

import { transactionColumns } from "./transaction.columns";
import { transactionFilters } from "./transaction.filters";
import { Transaction } from "./transaction.types";

interface Props {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: Props) {
  return (
    <DataTable
      columns={transactionColumns}
      data={transactions}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={transactionFilters}
    />
  );
}