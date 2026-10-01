"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinancialAccount, InvestmentHolding, getAccountHoldings, getClientFinancialAccounts } from "@/lib/api";

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
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [status, setStatus] = useState("COMPLETED");
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
  const [accountId, setAccountId] = useState("");
  const [holdingId, setHoldingId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getClientFinancialAccounts(token, customerId).then((result) => setAccounts(result.accounts));
  }, [token, customerId]);

  useEffect(() => {
    if (!accountId) { setHoldings([]); setHoldingId(""); return; }
    void getAccountHoldings(token, Number(accountId)).then((result) => setHoldings(result.holdings));
  }, [token, accountId]);

  useEffect(() => {
    if (!initialData) {
      const today = new Date().toISOString().split("T")[0];

      setTransactionDate(today);
      setTransactionType("BUY");
      setAmount("");
      setQuantity(""); setUnitPrice("");
      setStatus("COMPLETED");
      setDescription("");
      setReferenceNumber("");
      setNotes("");
      setAccountId(""); setHoldingId("");

      return;
    }

    setTransactionDate(initialData.transaction_date);
    setTransactionType(initialData.transaction_type);
    setAmount(String(initialData.amount));
    setQuantity(initialData.quantity == null ? "" : String(initialData.quantity));
    setUnitPrice(initialData.unit_price == null ? "" : String(initialData.unit_price));
    setStatus(initialData.status);
    setDescription(initialData.description ?? "");
    setReferenceNumber(initialData.reference_number ?? "");
    setNotes(initialData.notes ?? "");
    setAccountId(initialData.financial_account_id ? String(initialData.financial_account_id) : "");
    setHoldingId(initialData.holding_id ? String(initialData.holding_id) : "");
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
          quantity: quantity ? Number(quantity) : null,
          unit_price: unitPrice ? Number(unitPrice) : null,
          status,
          description: description || undefined,
          reference_number: referenceNumber || undefined,
          notes: notes || undefined,
          financial_account_id: accountId ? Number(accountId) : null,
          holding_id: holdingId ? Number(holdingId) : null,
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
          quantity: quantity ? Number(quantity) : undefined,
          unit_price: unitPrice ? Number(unitPrice) : undefined,
          status,
          description: description || undefined,
          reference_number: referenceNumber || undefined,
          notes: notes || undefined,
          financial_account_id: accountId ? Number(accountId) : undefined,
          holding_id: holdingId ? Number(holdingId) : undefined,
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
        <div className="space-y-2"><label className="text-sm font-medium">Financial Account</label><select value={accountId} onChange={(e) => { setAccountId(e.target.value); setHoldingId(""); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Unallocated</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.account_name}</option>)}</select></div>
        <div className="space-y-2"><label className="text-sm font-medium">Holding</label><select value={holdingId} onChange={(e) => setHoldingId(e.target.value)} disabled={!accountId} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">No holding</option>{holdings.map((holding) => <option key={holding.id} value={holding.id}>{holding.security_name}</option>)}</select></div>

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

        <div className="space-y-2"><label className="text-sm font-medium">Quantity</label><Input type="number" min="0.00000001" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required={Boolean(holdingId) && ["BUY", "SELL"].includes(transactionType)} /></div>
        <div className="space-y-2"><label className="text-sm font-medium">Unit Price</label><Input type="number" min="0" step="0.0001" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required={Boolean(holdingId) && ["BUY", "SELL"].includes(transactionType)} /></div>

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
