import { getClientById as getClientByIdFromApi } from "@/lib/api";
import type { Client } from "@/lib/api";

export async function getClientById(
  id: string
): Promise<Client | undefined> {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("finplan_token")
        : null;

    if (!token) {
      return undefined;
    }

    return await getClientByIdFromApi(token, id);
  } catch (error) {
    console.error("Failed to load client:", error);
    return undefined;
  }
}