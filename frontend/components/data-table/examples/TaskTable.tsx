"use client";

import { DataTable } from "@/components/data-table";

import { taskColumns } from "./task.columns";
import { taskFilters } from "./task.filters";
import { Task } from "./task.types";

interface Props {
  tasks: Task[];
}

export default function TaskTable({ tasks }: Props) {
  return (
    <DataTable
      columns={taskColumns}
      data={tasks}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={taskFilters}
    />
  );
}