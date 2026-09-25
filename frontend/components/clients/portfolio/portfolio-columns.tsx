"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Holding } from "./portfolio-types";

export const portfolioColumns: ColumnDef<Holding>[] = [
  {
    accessorKey: "fundName",
    header: "Fund",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "folioNumber",
    header: "Folio",
  },
  {
    accessorKey: "units",
    header: "Units",
  },
  {
    accessorKey: "nav",
    header: "NAV",
    cell: ({ row }) =>
      `₹${row.original.nav.toFixed(2)}`,
  },
  {
    accessorKey: "investedValue",
    header: "Invested",
    cell: ({ row }) =>
      `₹${row.original.investedValue.toLocaleString("en-IN")}`,
  },
  {
    accessorKey: "currentValue",
    header: "Current Value",
    cell: ({ row }) =>
      `₹${row.original.currentValue.toLocaleString("en-IN")}`,
  },
  {
    accessorKey: "gain",
    header: "Gain",
    cell: ({ row }) => (
      <span
        className={
          row.original.gain >= 0
            ? "text-green-600 font-medium"
            : "text-red-600 font-medium"
        }
      >
        ₹{row.original.gain.toLocaleString("en-IN")}
      </span>
    ),
  },
];