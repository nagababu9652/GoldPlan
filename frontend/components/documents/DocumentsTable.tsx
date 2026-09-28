"use client";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";

import { documentColumns } from "./columns";
import { ClientDocument } from "./types";

interface Props {
  documents: ClientDocument[];
}

export default function DocumentsTable({
  documents,
}: Props) {
  return (
    <EnterpriseTable
      columns={documentColumns}
      data={documents}
    />
  );
}