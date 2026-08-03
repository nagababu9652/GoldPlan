export interface Product {
  id: string;
  name: string;
  category: "mutual-fund" | "insurance" | "bond" | "fd" | "nps";
  provider: string;
  minInvestment: number;
  expectedReturns: number;
  lockInPeriod: number;
  riskLevel: "low" | "moderate" | "high" | "very-high";
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}