import DocumentsSummary from "./DocumentsSummary";
import DocumentsToolbar from "./DocumentsToolbar";
import DocumentsTable from "./DocumentsTable";

import { ClientDocument } from "./types";

interface Props {
  documents: ClientDocument[];
}

export default function ClientDocuments({
  documents,
}: Props) {
  const verified = documents.filter(
    (d) => d.status === "Verified"
  ).length;

  const pending = documents.filter(
    (d) => d.status === "Pending"
  ).length;

  return (
    <div className="space-y-3">

      <DocumentsSummary
        total={documents.length}
        verified={verified}
        pending={pending}
      />

      <DocumentsToolbar />

      <DocumentsTable
        documents={documents}
      />

    </div>
  );
}