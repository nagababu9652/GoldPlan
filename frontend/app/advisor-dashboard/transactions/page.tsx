"use client";

import { useCallback, useEffect, useState } from "react";

import { Plus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getClients, type Client } from "@/lib/api";

import TransactionDialog from "./TransactionDialog";
import TransactionDetails from "./TransactionDetails";
import TransactionTable from "./TransactionTable";
import {
  getTransactions,
  getTransactionHistory,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type AdvisorTransaction,
  type TransactionHistory,
} from "./transaction.service";
import TransactionHistoryDialog from "./TransactionHistoryDialog";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<
    AdvisorTransaction[]
  >([]);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] =
    useState<number | null>(null);

  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionType, setTransactionType] = useState("");

  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<AdvisorTransaction | undefined>(undefined);

  const [viewingTransaction, setViewingTransaction] =
    useState<AdvisorTransaction | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [historyTransaction, setHistoryTransaction] =
  useState<AdvisorTransaction | null>(null);

  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("finplan_token")
      : null;

  const loadTransactions = useCallback(async () => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getTransactions(token, {
        transaction_status: transactionStatus || undefined,
        transaction_type: transactionType || undefined,
      });

      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }, [token, transactionStatus, transactionType]);

  const loadClients = useCallback(async () => {
    if (!token) {
      setClientsLoading(false);
      return;
    }

    try {
      setClientsLoading(true);

      const response = await getClients(token);

      setClients(response.clients);

      if (response.clients.length === 1) {
        setSelectedCustomerId(response.clients[0].id);
      }
    } catch (err) {
      console.error("Failed to load clients:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load clients."
      );
    } finally {
      setClientsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTransactions();
    loadClients();
  }, [loadTransactions, loadClients]);

  function handleCreate() {
    setEditingTransaction(undefined);
    setDialogOpen(true);
  }

  function handleEdit(transaction: AdvisorTransaction) {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  }

  function handleView(transaction: AdvisorTransaction) {
    setViewingTransaction(transaction);
  }

  async function handleDelete(transaction: AdvisorTransaction) {
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const confirmed = window.confirm(
      `Delete transaction #${transaction.id}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(transaction.id);
      setError("");

      await deleteTransaction(token, transaction.id);

      await loadTransactions();
    } catch (err) {
      console.error("Failed to delete transaction:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete transaction."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleHistory(transaction: AdvisorTransaction) {
    if (!token) {
      return;
    }

    setHistoryTransaction(transaction);
    setTransactionHistory([]);
    setHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const history = await getTransactionHistory(token, transaction.id);
      setTransactionHistory(history);
    } catch (err) {
      console.error("Failed to load transaction history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleDialogSuccess(transaction: AdvisorTransaction) {
    setTransactions((current) => {
      const exists = current.some(
        (item) => item.id === transaction.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === transaction.id ? transaction : item
        );
      }

      return [transaction, ...current];
    });
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-line bg-bone p-8 text-center">
        <p className="text-sm text-red-600">
          You are not logged in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Transactions
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage financial transactions for your clients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <select
            value={transactionStatus}
            onChange={(e) => setTransactionStatus(e.target.value)}
            className="h-10 rounded-md border border-line bg-bone px-3 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="h-10 rounded-md border border-line bg-bone px-3 text-sm"
          >
            <option value="">All Types</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
            <option value="DIVIDEND">Dividend</option>
          </select>

        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

          {clients.length > 1 && (
            <select
              value={selectedCustomerId ?? ""}
              onChange={(e) =>
                setSelectedCustomerId(
                  e.target.value
                    ? Number(e.target.value)
                    : null
                )
              }
              disabled={clientsLoading}
              className="h-10 rounded-md border border-line bg-bone px-3 text-sm"
            >
              <option value="">
                Select client
              </option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.customer_code})
                </option>
              ))}
            </select>
          )}

          <Button
            variant="outline"
            onClick={loadTransactions}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>

          <Button
            onClick={handleCreate}
            disabled={
              clientsLoading ||
              selectedCustomerId === null
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-bone p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            Loading transactions...
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-line bg-bone p-10 text-center">
          <p className="text-lg font-medium">
            No transactions found
          </p>

          <p className="mt-2 text-sm text-ash">
            Create your first transaction to get started.
          </p>
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          onView={handleView}
          onEdit={handleEdit}
          onHistory={handleHistory}
          onDelete={handleDelete}
        />
      )}

      {/* Create / Edit Dialog */}
      {selectedCustomerId !== null && (
        <TransactionDialog
          open={dialogOpen}
          token={token}
          customerId={
            editingTransaction?.customer_id ??
            selectedCustomerId
          }
          initialData={editingTransaction}
          onClose={() => {
            setDialogOpen(false);
            setEditingTransaction(undefined);
          }}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* View Dialog */}
      {viewingTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setViewingTransaction(null);
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-bone shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-details-title"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">

              <div>
                <h2
                  id="transaction-details-title"
                  className="text-xl font-semibold"
                >
                  Transaction Details
                </h2>

                <p className="mt-1 text-sm text-ash">
                  Transaction #{viewingTransaction.id}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingTransaction(null)}
                aria-label="Close"
                className="h-9 w-9 p-0"
              >
                <X className="h-4 w-4" />
              </Button>

            </div>

            <div className="p-6">
              <TransactionDetails
                transaction={viewingTransaction}
              />
            </div>
          </div>
        </div>
      )}

      <TransactionHistoryDialog
        open={historyOpen}
        transaction={historyTransaction}
        history={transactionHistory}
        loading={historyLoading}
        onClose={() => {
          setHistoryOpen(false);
          setHistoryTransaction(null);
          setTransactionHistory([]);
        }}
      />

      {deletingId !== null && (
        <div className="sr-only">
          Deleting transaction {deletingId}
        </div>
      )}

    </div>
  );
}