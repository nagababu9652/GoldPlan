import { STP } from "./stp.types";

export async function getSTPs(): Promise<STP[]> {
  const res = await fetch("/api/stps");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch STPs: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<STP[]>;
}

export async function deleteSTP(id: string): Promise<void> {
  const res = await fetch(`/api/stps/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete STP: ${res.status} ${res.statusText}`
    );
  }
}