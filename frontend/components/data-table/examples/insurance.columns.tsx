import { ColumnDef } from "@tanstack/react-table";

import {
  StatusColumn,
  CurrencyColumn,
  DateColumn,
  ActionColumn,
} from "@/components/data-table";

import { insuranceActions } from "./insurance.actions";
import { Insurance } from "./insurance.types";

export const insuranceColumns: ColumnDef<Insurance>[] = [
  {
    accessorKey: "policyNumber",
    header: "Policy No.",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "insurer",
    header: "Insurer",
  },
  {
    accessorKey: "policyType",
    header: "Type",
  },
  {
    accessorKey: "premium",
    header: "Premium",
    cell: ({ row }) => <CurrencyColumn value={row.original.premium} />,
  },
  {
    accessorKey: "sumAssured",
    header: "Sum Assured",
    cell: ({ row }) => <CurrencyColumn value={row.original.sumAssured} />,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => <DateColumn value={row.original.startDate} />,
  },
  {
    accessorKey: "maturityDate",
    header: "Maturity Date",
    cell: ({ row }) => <DateColumn value={row.original.maturityDate} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusColumn value={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn row={row.original} actions={insuranceActions} />
    ),
  },
];