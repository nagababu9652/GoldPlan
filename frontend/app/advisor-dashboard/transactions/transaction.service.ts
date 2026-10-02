import {
  advisorFetch,
  advisorPost,
  advisorPut,
  advisorDelete,
} from "@/lib/api";

export interface AdvisorTransaction {
  id: number;
  customer_id: number;
  financial_account_id?: number | null;
  holding_id?: number | null;
  transaction_date: string;
  transaction_type: string;
  amount: number | string;
  quantity?: number | string | null;
  unit_price?: number | string | null;
  description?: string | null;
  status: string;
  reference_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface TransactionHistory {
  id: number;
  transaction_id: number;
  action: string;
  changed_by?: number | null;
  changed_at: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
}

export interface TransactionCreate {
  customer_id: number;
  financial_account_id?: number;
  holding_id?: number;
  transaction_date: string;
  transaction_type: string;
  amount: number;
  quantity?: number;
  unit_price?: number;
  description?: string;
  status?: string;
  reference_number?: string;
  notes?: string;
}

export interface TransactionUpdate {
  financial_account_id?: number | null;
  holding_id?: number | null;
  transaction_date?: string;
  transaction_type?: string;
  amount?: number;
  quantity?: number | null;
  unit_price?: number | null;
  description?: string;
  status?: string;
  reference_number?: string;
  notes?: string;
}

export async function getTransactions(
  token: string,
  params?: {
    limit?: number;
    customer_id?: number;
    transaction_type?: string;
    transaction_status?: string;
  }
): Promise<AdvisorTransaction[]> {
  const query = new URLSearchParams();

  if (params?.limit) {
    query.set("limit", String(params.limit));
  }

  if (params?.customer_id) {
    query.set("customer_id", String(params.customer_id));
  }

  if (params?.transaction_type) {
    query.set("transaction_type", params.transaction_type);
  }

  if (params?.transaction_status) {
    query.set("transaction_status", params.transaction_status);
  }

  const queryString = query.toString();

  return advisorFetch(
    `/transactions${queryString ? `?${queryString}` : ""}`,
    token
  );
}



export async function getTransaction(
  token: string,
  id: number
): Promise<AdvisorTransaction> {
  return advisorFetch(`/transactions/${id}`, token);
}


export async function getTransactionHistory(
  token: string,
  transactionId: number
): Promise<TransactionHistory[]> {
  return advisorFetch(
    `/transactions/${transactionId}/history`,
    token
  );
}

export async function createTransaction(
  token: string,
  data: TransactionCreate,
  idempotencyKey = crypto.randomUUID(),
): Promise<AdvisorTransaction> {
  return advisorPost("/transactions", token, data, idempotencyKey);
}

export async function updateTransaction(
  token: string,
  id: number,
  data: TransactionUpdate
): Promise<AdvisorTransaction> {
  return advisorPut(`/transactions/${id}`, token, data);
}

export async function deleteTransaction(
  token: string,
  id: number
): Promise<void> {
  await advisorDelete(`/transactions/${id}`, token);
}
