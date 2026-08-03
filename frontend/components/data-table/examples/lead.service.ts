import { Lead } from "./lead.types";

export async function getLeads(): Promise<Lead[]> {
  const res = await fetch("/api/leads");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch leads: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Lead[]>;
}

export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`/api/leads/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete lead: ${res.status} ${res.statusText}`
    );
  }
}