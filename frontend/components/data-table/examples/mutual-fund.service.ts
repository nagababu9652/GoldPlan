import { MutualFund } from "./mutual-fund.types";

export async function getMutualFunds(): Promise<MutualFund[]> {
  const res = await fetch("/api/mutual-funds");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch mutual funds: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<MutualFund[]>;
}

export async function deleteMutualFund(id: string): Promise<void> {
  const res = await fetch(`/api/mutual-funds/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete mutual fund: ${res.status} ${res.statusText}`
    );
  }
}