"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { AdvisorTransaction, TransactionHistory } from "./transaction.service";

interface TransactionHistoryDialogProps {
  open: boolean;
  transaction: AdvisorTransaction | null;
  history: TransactionHistory[];
  loading?: boolean;
  onClose: () => void;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN");
}

function formatValue(value: Record<string, unknown> | null | undefined) {
  if (!value) {
    return "—";
  }

  return JSON.stringify(value, null, 2);
}

export default function TransactionHistoryDialog({
  open,
  transaction,
  history,
  loading = false,
  onClose,
}: TransactionHistoryDialogProps) {
  if (!open || !transaction) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-line bg-bone shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-history-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2
              id="transaction-history-dialog-title"
              className="text-xl font-semibold"
            >
              Transaction History
            </h2>

            <p className="mt-1 text-sm text-ash">
              Transaction #{transaction.id}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-10 text-center text-sm text-ash">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-lg border border-line px-4 py-8 text-center">
              <p className="text-sm text-ash">
                No history records found for this transaction.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-line p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase">
                        {item.action}
                      </span>

                      {item.changed_by !== null &&
                        item.changed_by !== undefined && (
                          <span className="text-sm text-ash">
                            Changed by #{item.changed_by}
                          </span>
                        )}
                    </div>

                    <span className="text-sm text-ash">
                      {formatDateTime(item.changed_at)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ash">
                        Before
                      </p>

                      <pre className="max-h-80 overflow-auto rounded-lg border border-line bg-obsidian/5 p-4 text-xs leading-5 text-obsidian">
                        {formatValue(item.old_values)}
                      </pre>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ash">
                        After
                      </p>

                      <pre className="max-h-80 overflow-auto rounded-lg border border-line bg-obsidian/5 p-4 text-xs leading-5 text-obsidian">
                        {formatValue(item.new_values)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}