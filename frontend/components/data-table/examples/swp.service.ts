import { SWP } from "./swp.types";

export async function getSWPs(): Promise<SWP[]> {
  const res = await fetch("/api/swps");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch SWPs: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<SWP[]>;
}

export async function deleteSWP(id: string): Promise<void> {
  const res = await fetch(`/api/swps/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete SWP: ${res.status} ${res.statusText}`
    );
  }
}