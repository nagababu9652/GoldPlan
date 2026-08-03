"use client";

import { DataTable } from "@/components/data-table";

import { roleColumns } from "./role.columns";
import { roleFilters } from "./role.filters";
import { Role } from "./role.types";

interface Props {
  roles: Role[];
}

export default function RoleTable({ roles }: Props) {
  return (
    <DataTable
      columns={roleColumns}
      data={roles}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={roleFilters}
    />
  );
}