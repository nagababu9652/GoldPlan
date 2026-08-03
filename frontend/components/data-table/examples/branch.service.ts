import { Branch } from "./branch.types";

export async function getBranches(): Promise<Branch[]> {
  const res = await fetch("/api/branches");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch branches: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Branch[]>;
}

export async function deleteBranch(id: string): Promise<void> {
  const res = await fetch(`/api/branches/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete branch: ${res.status} ${res.statusText}`
    );
  }
}