"use client";

import { DataTable } from "@/components/data-table";

import { notificationColumns } from "./notification.columns";
import { notificationFilters } from "./notification.filters";
import { Notification } from "./notification.types";

interface Props {
  notifications: Notification[];
}

export default function NotificationTable({ notifications }: Props) {
  return (
    <DataTable
      columns={notificationColumns}
      data={notifications}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={notificationFilters}
    />
  );
}