import { Transaction } from "./transaction.types";

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch("/api/transactions");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch transactions: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Transaction[]>;
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete transaction: ${res.status} ${res.statusText}`
    );
  }
}