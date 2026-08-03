import { Product } from "./product.types";

export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");

  if (!res.ok) {
    throw new Error(
      `Failed to fetch products: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<Product[]>;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to delete product: ${res.status} ${res.statusText}`
    );
  }
}