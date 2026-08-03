export interface SWP {
  id: string;
  customerName: string;
  customerPan: string;
  schemeName: string;
  amc: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "weekly";
  installments: number;
  completedInstallments: number;
  startDate: string;
  endDate: string;
  nextDate: string;
  status: "active" | "paused" | "completed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}