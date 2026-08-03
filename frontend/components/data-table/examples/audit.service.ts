import { Audit } from "./audit.types";

export async function getAudits(): Promise<Audit[]> {
  const res = await fetch("/api/audits");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch audits: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Audit[]>;
}

export async function deleteAudit(id: string): Promise<void> {
  const res = await fetch(`/api/audits/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete audit: ${res.status} ${res.statusText}`
    );
  }
}