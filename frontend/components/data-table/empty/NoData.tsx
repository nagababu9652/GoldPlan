"use client";

import DataTableEmpty from "./DataTableEmpty";

export default function NoData() {
  return (
    <DataTableEmpty
      title="No data available"
      description="Records will appear here once they are created."
    />
  );
}