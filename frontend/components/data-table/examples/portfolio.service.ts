import { Portfolio } from "./portfolio.types";

export async function getPortfolios(): Promise<Portfolio[]> {
  const res = await fetch("/api/portfolios");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch portfolios: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Portfolio[]>;
}

export async function deletePortfolio(id: string): Promise<void> {
  const res = await fetch(`/api/portfolios/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete portfolio: ${res.status} ${res.statusText}`
    );
  }
}