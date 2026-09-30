"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  createTransaction,
  updateTransaction,
  type AdvisorTransaction,
  type TransactionCreate,
  type TransactionUpdate,
} from "./transaction.service";

interface TransactionFormProps {
  token: string;
  customerId: number;
  initialData?: AdvisorTransaction;
  onSuccess?: (transaction: AdvisorTransaction) => void;
  onCancel?: () => void;
}

export default function TransactionForm({
  token,
  customerId,
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const isEditMode = Boolean(initialData);

  const [transactionDate, setTransactionDate] = useState("");
  const [transactionType, setTransactionType] = useState("BUY");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("COMPLETED");
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialData) {
      const today = new Date().toISOString().split("T")[0];

      setTransactionDate(today);
      setTransactionType("BUY");
      setAmount("");
      setStatus("COMPLETED");
      setDescription("");
      setReferenceNumber("");
      setNotes("");

      return;
    }

    setTransactionDate(initialData.transaction_date);
    setTransactionType(initialData.transaction_type);
    setAmount(String(initialData.amount));
    setStatus(initialData.status);
    setDescription(initialData.description ?? "");
    setReferenceNumber(initialData.reference_number ?? "");
    setNotes(initialData.notes ?? "");
  }, [initialData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!transactionDate) {
      setError("Transaction date is required.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && initialData) {
        const payload: TransactionUpdate = {
          transaction_date: transactionDate,
          transaction_type: transactionType,
          amount: Number(amount),
          status,
          description: description || undefined,
          reference_number: referenceNumber || undefined,
          notes: notes || undefined,
        };

        const updatedTransaction = await updateTransaction(
          token,
          initialData.id,
          payload
        );

        onSuccess?.(updatedTransaction);
      } else {
        const payload: TransactionCreate = {
          customer_id: customerId,
          transaction_date: transactionDate,
          transaction_type: transactionType,
          amount: Number(amount),
          status,
          description: description || undefined,
          reference_number: referenceNumber || undefined,
          notes: notes || undefined,
        };

        const createdTransaction = await createTransaction(
          token,
          payload
        );

        onSuccess?.(createdTransaction);
      }
    } catch (err) {
      console.error("Failed to save transaction:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save transaction."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {error && (
        <div className="rounded-lg border border-red-200 bg-bone p-3">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Transaction Date
          </label>

          <Input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Transaction Type
          </label>

          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            disabled={loading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
            <option value="DIVIDEND">Dividend</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Amount
          </label>

          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">
            Description
          </label>

          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter transaction description"
            disabled={loading}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">
            Reference Number
          </label>

          <Input
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Enter reference number"
            disabled={loading}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes"
            disabled={loading}
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3">

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}

        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Transaction"
              : "Create Transaction"}
        </Button>

      </div>

    </form>
  );
}