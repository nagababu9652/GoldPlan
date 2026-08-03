import { SIP } from "./sip.types";

export async function getSIPs(): Promise<SIP[]> {
  const res = await fetch("/api/sips");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch SIPs: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<SIP[]>;
}

export async function deleteSIP(id: string): Promise<void> {
  const res = await fetch(`/api/sips/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete SIP: ${res.status} ${res.statusText}`
    );
  }
}