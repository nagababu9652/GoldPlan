export interface Insurance {
  id: string;
  policyNumber: string;
  customerName: string;
  customerPan: string;
  productName: string;
  insurer: string;
  premium: number;
  sumAssured: number;
  policyType: "term" | "whole-life" | "endowment" | "ulip" | "health";
  status: "active" | "lapsed" | "matured" | "cancelled";
  startDate: string;
  maturityDate: string;
  createdAt?: string;
  updatedAt?: string;
}