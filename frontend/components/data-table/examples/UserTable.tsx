"use client";

import { DataTable } from "@/components/data-table";

import { userColumns } from "./user.columns";
import { userFilters } from "./user.filters";
import { User } from "./user.types";

interface Props {
  users: User[];
}

export default function UserTable({ users }: Props) {
  return (
    <DataTable
      columns={userColumns}
      data={users}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={userFilters}
    />
  );
}