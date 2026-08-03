export interface Portfolio {
  id: string;
  name: string;
  customerName: string;
  customerPan: string;
  totalValue: number;
  investedAmount: number;
  returns: number;
  returnsPercent: number;
  status: "active" | "inactive" | "closed";
  createdAt?: string;
  updatedAt?: string;
}