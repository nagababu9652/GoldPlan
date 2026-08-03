"use client";

import {
  Widget,
  WidgetHeader,
  WidgetBody,
  WidgetFooter,
  WidgetMenu,
} from "../base";

import TransactionRow from "./TransactionRow";
import { recentTransactions } from "./mockData";

import { Button } from "@/components/ui/button";

export default function RecentTransactionsWidget() {
  return (
    <Widget>

      <WidgetHeader
        title="Recent Transactions"
        description="Latest client investment activities"
        actions={<WidgetMenu />}
      />

      <WidgetBody>

        <div className="space-y-3">

          {recentTransactions.map((transaction) => (
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