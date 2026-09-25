"use client";

import type { AdvisorTransaction } from "./transaction.service";

interface TransactionDetailsProps {
  transaction: AdvisorTransaction;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-ash">
        {label}
      </p>

      <p className="text-sm text-obsidian">
        {value === null || value === undefined || value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

export default function TransactionDetails({
  transaction,
}: TransactionDetailsProps) {
  const amount = Number(transaction.amount);

  return (
    <div className="space-y-6">

      <div className="grid gap-5 md:grid-cols-2">

        <DetailItem
          label="Transaction ID"
          value={transaction.id}
        />

        <DetailItem
          label="Customer ID"
          value={transaction.customer_id}
        />

        <DetailItem
          label="Transaction Date"
          value={transaction.transaction_date}
        />

        <DetailItem
          label="Transaction Type"
          value={transaction.transaction_type}
        />

        <DetailItem
          label="Amount"
          value={
            Number.isFinite(amount)
              ? `₹${amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "—"
          }
        />

        <DetailItem
          label="Status"
          value={transaction.status}
        />

        <DetailItem
          label="Reference Number"
          value={transaction.reference_number}
        />

        <DetailItem
          label="Created At"
          value={transaction.created_at}
        />

        <DetailItem
          label="Updated At"
          value={transaction.updated_at}
        />

      </div>

      <div className="border-t border-line pt-5">

        <DetailItem
          label="Description"
          value={transaction.description}
        />

      </div>

      <div className="border-t border-line pt-5">

        <DetailItem
          label="Notes"
          value={transaction.notes}
        />

      </div>

    </div>
  );
}