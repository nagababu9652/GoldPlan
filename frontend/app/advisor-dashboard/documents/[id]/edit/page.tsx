import { notFound } from "next/navigation";

import DocumentForm from "@/components/documents/form/DocumentForm";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isInteger(documentId)) {
    notFound();
  }

  return (
    <DocumentForm
      mode="edit"
      documentId={documentId}
    />
  );
}