import { notFound } from "next/navigation";

import DocumentDetail from "@/components/documents/detail/DocumentDetail";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isInteger(documentId)) {
    notFound();
  }

  return <DocumentDetail documentId={documentId} />;
}