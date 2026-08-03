"use client";

import { DataTable } from "@/components/data-table";

import { productColumns } from "./product.columns";
import { productFilters } from "./product.filters";
import { Product } from "./product.types";

interface Props {
  products: Product[];
}

export default function ProductTable({ products }: Props) {
  return (
    <DataTable
      columns={productColumns}
      data={products}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={productFilters}
    />
  );
}