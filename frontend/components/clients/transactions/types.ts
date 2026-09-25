export type TransactionType =
  | "Purchase"
  | "Redeem"
  | "SIP"
  | "SWP"
  | "Switch";

export type TransactionStatus =
  | "Completed"
  | "Pending"
  | "Failed";

export interface Transaction {

  id: string;

  date: string;

  scheme: string;

  type: TransactionType;

  amount: number;

  units: number;

  nav: number;

  status: TransactionStatus;

}