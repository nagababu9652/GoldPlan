import { User } from "./user.types";

export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/users");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch users: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<User[]>;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete user: ${res.status} ${res.statusText}`
    );
  }
}