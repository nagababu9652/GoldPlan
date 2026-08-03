import { Eye, Pencil, Trash2, History } from "lucide-react";

import { RowAction } from "@/components/data-table";

import { Product } from "./product.types";

export const productActions: RowAction<Product>[] = [
  {
    id: "view",
    label: "View",
    icon: <Eye size={16} />,
    onClick: (product: Product) => {
      console.log("View product:", product.id);
    },
  },
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil size={16} />,
    onClick: (product: Product) => {
      console.log("Edit product:", product.id);
    },
  },
  {
    id: "history",
    label: "History",
    icon: <History size={16} />,
    onClick: (product: Product) => {
      console.log("History for product:", product.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 size={16} />,
    variant: "danger",
    onClick: (product: Product) => {
      console.log("Delete product:", product.id);
    },
  },
];