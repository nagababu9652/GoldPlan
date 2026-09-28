import ClientDocuments from "@/components/documents/ClientDocuments";
import { getDocuments } from "@/components/documents/api";

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <ClientDocuments
      documents={documents}
    />
  );
}