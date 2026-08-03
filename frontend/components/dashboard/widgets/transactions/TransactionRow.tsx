"use client";

import { Transaction } from "./types";
import TransactionStatus from "./TransactionStatus";
import TransactionAmount from "./TransactionAmount";
import TransactionType from "./TransactionType";

interface Props {
  transaction: Transaction;
}

export default function TransactionRow({
  transaction,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">

      <div>

        <div className="font-medium">

          {transaction.clientName}

        </div>

        <div className="text-sm text-muted-foreground">

          {transaction.scheme}

        </div>

      </div>

      <TransactionType
        type={transaction.type}
      />

      <TransactionAmount
        amount={transaction.amount}
      />

      <TransactionStatus
        status={transaction.status}
      />

    </div>
  );
}