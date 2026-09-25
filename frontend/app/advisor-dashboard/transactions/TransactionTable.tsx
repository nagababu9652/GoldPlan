"use client";

import { useMemo } from "react";

import { DataTable } from "@/components/data-table";

import { createTransactionActions } from "./transaction.actions";
import { transactionColumns } from "./transaction.columns";
import { AdvisorTransaction } from "./transaction.service";

interface Props {
  transactions: AdvisorTransaction[];
  onView?: (transaction: AdvisorTransaction) => void;
  onEdit?: (transaction: AdvisorTransaction) => void;
  onHistory?: (transaction: AdvisorTransaction) => void;
  onDelete?: (transaction: AdvisorTransaction) => void;
}

export default function TransactionTable({
  transactions,
  onView,
  onEdit,
  onHistory,
  onDelete,
}: Props) {
  const actions = useMemo(
    () =>
      createTransactionActions({
        onView: onView ?? (() => {}),
        onEdit: onEdit ?? (() => {}),
        onHistory: onHistory ?? (() => {}),
        onDelete: onDelete ?? (() => {}),
      }),
    [onView, onEdit, onHistory, onDelete]
  );

  const columns = useMemo(
    () => transactionColumns(actions),
    [actions]
  );

  return (
    <DataTable
      columns={columns}
      data={transactions}
      searchable
      filterable
      selectable
      pagination
      exportable
    />
  );
}