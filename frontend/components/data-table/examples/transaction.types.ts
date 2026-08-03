export interface Transaction {
  id: string;
  type: "buy" | "sell" | "dividend" | "switch";
  schemeName: string;
  customerName: string;
  amount: number;
  units: number;
  nav: number;
  date: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}