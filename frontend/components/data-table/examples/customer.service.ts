import { Customer } from "./customer.types";

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch("/api/customers");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch customers: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Customer[]>;
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`/api/customers/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete customer: ${res.status} ${res.statusText}`
    );
  }
}