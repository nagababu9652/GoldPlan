import { Prospect } from "./prospect.types";

export async function getProspects(): Promise<Prospect[]> {
  const res = await fetch("/api/prospects");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch prospects: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Prospect[]>;
}

export async function deleteProspect(id: string): Promise<void> {
  const res = await fetch(`/api/prospects/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete prospect: ${res.status} ${res.statusText}`
    );
  }
}