import { Role } from "./role.types";

export async function getRoles(): Promise<Role[]> {
  const res = await fetch("/api/roles");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch roles: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Role[]>;
}

export async function deleteRole(id: string): Promise<void> {
  const res = await fetch(`/api/roles/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete role: ${res.status} ${res.statusText}`
    );
  }
}