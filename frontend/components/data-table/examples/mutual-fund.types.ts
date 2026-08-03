export interface MutualFund {
  id: string;
  schemeName: string;
  amc: string;
  category: "equity" | "debt" | "hybrid" | "liquid" | "elss";
  nav: number;
  aum: number;
  expenseRatio: number;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}