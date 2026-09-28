export type PortfolioStatus = "Active" | "Inactive" | "Watchlist" | "Archived";

export interface Portfolio {
  id: string;
  name: string;
  image?: string;
  type: string;
  value: number;
  returns: number;
  status: PortfolioStatus;
}
