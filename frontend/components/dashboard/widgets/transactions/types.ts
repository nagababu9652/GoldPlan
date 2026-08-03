export type TransactionStatus =
  | "SUCCESS"
  | "PENDING"
  | "FAILED"
  | "CANCELLED";

export type TransactionType =
  | "PURCHASE"
  | "REDEMPTION"
  | "SIP"
  | "SWP"
  | "STP"
  | "SWITCH";

export interface Transaction {
  id: string;

  clientName: string;

  scheme: string;

  amount: number;

  type: TransactionType;

  status: TransactionStatus;

  date: string;
}