"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import TransactionForm from "./TransactionForm";
import type { AdvisorTransaction } from "./transaction.service";

interface TransactionDialogProps {
  open: boolean;
  token: string;
  customerId: number;
  initialData?: AdvisorTransaction;
  onClose: () => void;
  onSuccess: (transaction: AdvisorTransaction) => void;
}

export default function TransactionDialog({
  open,
  token,
  customerId,
  initialData,
  onClose,
  onSuccess,
}: TransactionDialogProps) {
  if (!open) {
    return null;
  }

  const isEditMode = Boolean(initialData);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-bone shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2
              id="transaction-dialog-title"
              className="text-xl font-semibold"
            >
              {isEditMode
                ? "Edit Transaction"
                : "Create Transaction"}
            </h2>

            <p className="mt-1 text-sm text-ash">
              {isEditMode
                ? "Update the transaction details."
                : "Add a new financial transaction."}
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
          <TransactionForm
            token={token}
            customerId={customerId}
            initialData={initialData}
            onSuccess={(transaction) => {
              onSuccess(transaction);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}