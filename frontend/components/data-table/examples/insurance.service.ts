import { Insurance } from "./insurance.types";

export async function getInsurances(): Promise<Insurance[]> {
  const res = await fetch("/api/insurances");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch insurances: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Insurance[]>;
}

export async function deleteInsurance(id: string): Promise<void> {
  const res = await fetch(`/api/insurances/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete insurance: ${res.status} ${res.statusText}`
    );
  }
}