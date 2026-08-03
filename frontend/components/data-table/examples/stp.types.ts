export interface STP {
  id: string;
  customerName: string;
  customerPan: string;
  fromScheme: string;
  toScheme: string;
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