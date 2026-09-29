"use client";

import {
  Widget,
  WidgetHeader,
  WidgetBody,
  WidgetFooter,
  WidgetMenu,
} from "../base";

import { TransactionRow } from ".";
import type { Transaction } from "./types";

import { Button } from "@/components/ui/button";

export default function RecentTransactionsWidget() {
  const transactions: Transaction[] = [];

  return (
    <Widget>

      <WidgetHeader
        title="Recent Transactions"
        description="Latest client investment activities"
        actions={<WidgetMenu />}
      />

      <WidgetBody>

        <div className="space-y-3">

          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
            />
          ))}

        </div>

      </WidgetBody>

      <WidgetFooter>

        <Button
          variant="ghost"
          className="w-full"
        >
          View All Transactions
        </Button>

      </WidgetFooter>

    </Widget>
  );
}